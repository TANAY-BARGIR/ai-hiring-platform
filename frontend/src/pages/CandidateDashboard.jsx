import { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfileAndResumes = async () => {
    try {
      const res = await client.get('candidates/profile/');
      setProfile(res.data);
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndResumes();
    
    // Poll for updates if any resume is PENDING or PROCESSING
    const interval = setInterval(() => {
      setResumes(currentResumes => {
        const needsUpdate = currentResumes.some(
          r => r.processing_status === 'PENDING' || r.processing_status === 'PROCESSING'
        );
        if (needsUpdate) {
          fetchProfileAndResumes();
        }
        return currentResumes;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    // original_filename is set via backend but we can send file directly
    
    setUploading(true);
    try {
      await client.post('candidates/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Refresh list
      await fetchProfileAndResumes();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'READY': return <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/20"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>;
      case 'PROCESSING': return <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-medium border border-blue-400/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing</span>;
      case 'PENDING': return <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-medium border border-yellow-400/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'FAILED': return <span className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-medium border border-red-400/20"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and track AI processing of your resumes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile & Upload */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Profile Card */}
          <div className="bg-card/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                <div className="font-medium">{profile?.user?.first_name} {profile?.user?.last_name}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                <div className="font-medium">{profile?.location || 'Not specified'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Years of Experience</label>
                <div className="font-medium">{profile?.years_of_experience ?? 0} Years</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">AI Extracted Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile?.skills?.length > 0 ? profile.skills.map(skill => (
                    <span key={skill.id} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs font-medium text-foreground">
                      {skill.name}
                    </span>
                  )) : <span className="text-sm text-muted-foreground">No skills extracted yet. Upload a resume!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div 
            onClick={handleFileSelect}
            className={`bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf" 
              className="hidden" 
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {uploading ? <RefreshCw className="w-8 h-8 text-primary animate-spin" /> : <UploadCloud className="w-8 h-8 text-primary" />}
            </div>
            <h3 className="text-lg font-medium mb-2">{uploading ? 'Uploading...' : 'Upload New Resume'}</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mb-6">Drag and drop your PDF here, or click to browse files.</p>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50" disabled={uploading}>
              Select File
            </button>
          </div>

        </div>

        {/* Right Column - Resumes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Your Resumes</h2>
          
          <div className="space-y-4">
            {resumes.length === 0 && (
              <div className="p-8 text-center border border-white/5 rounded-2xl bg-card/20 text-muted-foreground">
                No resumes uploaded yet.
              </div>
            )}
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-card/40 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all hover:bg-card/60">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{resume.original_filename} {resume.is_primary && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">Primary</span>}</h3>
                    <StatusBadge status={resume.processing_status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Uploaded {new Date(resume.uploaded_at).toLocaleString()}</p>
                  
                  {resume.processing_status === "FAILED" && (
                    <p className="text-sm text-red-400/80">Error: {resume.failure_reason || "Unknown error"}</p>
                  )}
                  {resume.processing_status === "PENDING" && (
                    <p className="text-sm text-yellow-400/80">Waiting in queue to be processed by AI...</p>
                  )}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  {resume.file_url && (
                    <a href={resume.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none text-center border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
