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
    const interval = setInterval(() => {
      setResumes(currentResumes => {
        const needsUpdate = currentResumes.some(
          r => r.processing_status === 'PENDING' || r.processing_status === 'PROCESSING'
        );
        if (needsUpdate) fetchProfileAndResumes();
        return currentResumes;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await client.post('candidates/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchProfileAndResumes();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      READY:      { bg: 'bg-green-50', text: 'text-success', border: 'border-green-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Ready' },
      PROCESSING: { bg: 'bg-blue-50',  text: 'text-blue-600', border: 'border-blue-200', icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, label: 'Processing' },
      PENDING:    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
      FAILED:     { bg: 'bg-red-50',   text: 'text-danger', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Failed' },
    };
    const s = styles[status];
    if (!s) return null;
    return <span className={`flex items-center gap-1.5 ${s.text} ${s.bg} px-3 py-1 rounded-full text-xs font-semibold border ${s.border}`}>{s.icon} {s.label}</span>;
  };

  if (loading) return <div className="p-12 text-center text-slate-600">Loading dashboard...</div>;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Candidate Dashboard</h1>
          <p className="text-sm text-slate-600">Manage your profile and track AI processing of your resumes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column — Profile & Upload */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Profile Card */}
            <div className="bg-white border border-slate-300/40 shadow-card rounded-xl p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="text-sm font-medium text-slate-900">{profile?.user?.first_name} {profile?.user?.last_name}</div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <div className="text-sm font-medium text-slate-900">{profile?.location || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Experience</label>
                  <div className="text-sm font-medium text-slate-900">{profile?.years_of_experience ?? 0} Years</div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Extracted Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length > 0 ? profile.skills.map(skill => (
                      <span key={skill.id} className="bg-blue-50 px-2.5 py-1 rounded text-xs font-semibold text-navy-900 border border-blue-100">
                        {skill.name}
                      </span>
                    )) : <span className="text-sm text-slate-400 italic">No skills extracted yet.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div 
              onClick={handleFileSelect}
              className={`bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-blue-50/30 hover:border-blue-600 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                {uploading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
              </div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">{uploading ? 'Uploading...' : 'Upload New Resume'}</h3>
              <p className="text-sm text-slate-600 mb-4">Drop your PDF here or click to browse</p>
              <span className="bg-white text-navy-900 border border-slate-300 px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Select File
              </span>
            </div>
          </div>

          {/* Right Column — Resumes */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Your Resumes</h2>
            
            <div className="space-y-4">
              {resumes.length === 0 && (
                <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl bg-white text-slate-400">
                  No resumes uploaded yet.
                </div>
              )}
              {resumes.map((resume) => (
                <div key={resume.id} className="bg-white border border-slate-300/40 shadow-card rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-ambient transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-base text-navy-900">
                        {resume.original_filename}
                        {resume.is_primary && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Primary</span>}
                      </h3>
                      <StatusBadge status={resume.processing_status} />
                    </div>
                    <p className="text-xs text-slate-400">Uploaded {new Date(resume.uploaded_at).toLocaleString()}</p>
                    {resume.processing_status === "FAILED" && (
                      <p className="text-sm text-danger mt-2">Error: {resume.failure_reason || "Unknown error"}</p>
                    )}
                    {resume.processing_status === "PENDING" && (
                      <p className="text-sm text-amber-600 mt-2">Waiting in queue to be processed by AI...</p>
                    )}
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {resume.file_url && (
                      <a href={resume.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none text-center bg-white border border-slate-300 text-navy-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
