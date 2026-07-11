import { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, Clock, AlertCircle, RefreshCw, Briefcase, MapPin, Building2, Send, FileText, XCircle, ChevronRight } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1">Candidate Dashboard</h1>
            <p className="text-sm text-slate-600">Manage your profile, resumes, and job applications.</p>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            {['profile', 'jobs', 'applications'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'profile' ? 'Profile & Resumes' : tab === 'jobs' ? 'Job Board' : 'My Applications'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'jobs' && <JobsTab />}
        {activeTab === 'applications' && <ApplicationsTab />}

      </div>
    </div>
  );
}

// ─── Toast Notification Component ───
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[200] max-w-sm px-5 py-4 rounded-xl border shadow-lg flex items-center gap-3 animate-[slideUp_0.3s_ease-out] ${styles[type] || styles.info}`}>
      {type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
      {type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
      {type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-current opacity-50 hover:opacity-100">&times;</button>
    </div>
  );
}

// ─── Tab: Profile & Resumes ───
function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
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
      setToast({ message: 'Resume uploaded! AI is processing it now.', type: 'success' });
    } catch (err) {
      console.error('Upload failed', err);
      setToast({ message: 'Upload failed: ' + (err.response?.data?.detail || 'Unknown error'), type: 'error' });
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

  if (loading) return <div className="p-12 text-center text-slate-600">Loading profile...</div>;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Profile & Upload */}
        <div className="lg:col-span-1 flex flex-col gap-6">
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// ─── Tab: Job Board ───
function JobsTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingTo, setApplyingTo] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchJobsAndRank = async () => {
      try {
        // Fetch candidate profile to get their extracted skills
        const profileRes = await client.get('candidates/profile/');
        const candidateSkills = new Set((profileRes.data.skills || []).map(s => s.name.toLowerCase()));
        
        // Fetch active jobs
        const res = await client.get('jobs/');
        const jobsData = res.data.results || res.data;
        
        // Fetch already-applied jobs to disable Apply button
        const appsRes = await client.get('jobs/my-applications/');
        const appsData = appsRes.data.results || appsRes.data;
        const appliedSet = new Set(appsData.map(app => app.job));
        setAppliedJobs(appliedSet);
        
        // Calculate match score for each job
        const rankedJobs = jobsData.map(job => {
          let matchScore = 0;
          const required = job.required_skills || [];
          if (required.length > 0) {
            const matched = required.filter(s => candidateSkills.has(s.name.toLowerCase())).length;
            matchScore = matched / required.length;
          }
          return { ...job, matchScore };
        });
        
        // Sort by highest match score
        rankedJobs.sort((a, b) => b.matchScore - a.matchScore);
        
        setJobs(rankedJobs);
      } catch (err) {
        console.error('Failed to fetch and rank jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobsAndRank();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      await client.post('jobs/apply/', { job: jobId });
      setAppliedJobs(prev => new Set([...prev, jobId]));
      setToast({ message: 'Application submitted successfully! Track it in "My Applications".', type: 'success' });
    } catch (err) {
      if (err.response?.status === 400) {
        setToast({ message: 'You have already applied to this job.', type: 'info' });
        setAppliedJobs(prev => new Set([...prev, jobId]));
      } else {
        setToast({ message: 'Failed to submit application. Please try again.', type: 'error' });
      }
    } finally {
      setApplyingTo(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-600">Loading jobs...</div>;

  if (jobs.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-slate-300 rounded-xl bg-white">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-navy-900 font-bold text-lg">No open positions right now</p>
        <p className="text-slate-500 mt-2">Check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map(job => {
          const alreadyApplied = appliedJobs.has(job.id);
          return (
            <div key={job.id} className="bg-white border border-slate-300/40 shadow-card rounded-xl p-6 hover:shadow-ambient transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-navy-900">{job.title}</h3>
                      {job.matchScore > 0 && <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">{Math.round(job.matchScore * 100)}% Match</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-slate-400" /> {job.company_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {job.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {job.description}
                </p>

                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.required_skills || []).map(s => (
                      <span key={s.id} className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600 border border-slate-200">
                        {s.name}
                      </span>
                    ))}
                    {(!job.required_skills || job.required_skills.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No specific skills listed</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                {alreadyApplied ? (
                  <span className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-5 py-2 rounded-lg text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </span>
                ) : (
                  <button 
                    onClick={() => handleApply(job.id)}
                    disabled={applyingTo === job.id}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {applyingTo === job.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// ─── Tab: My Applications ───
function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await client.get('jobs/my-applications/');
        setApplications(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      APPLIED:     { bg: 'bg-blue-50',   text: 'text-blue-600',  border: 'border-blue-200',  icon: <Clock className="w-3.5 h-3.5" />,         label: 'Under Review' },
      SHORTLISTED: { bg: 'bg-green-50',  text: 'text-green-600', border: 'border-green-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />,  label: 'Shortlisted' },
      REJECTED:    { bg: 'bg-red-50',    text: 'text-red-600',   border: 'border-red-200',   icon: <XCircle className="w-3.5 h-3.5" />,      label: 'Not Selected' },
    };
    const s = styles[status];
    if (!s) return null;
    return (
      <span className={`flex items-center gap-1.5 ${s.text} ${s.bg} px-3 py-1.5 rounded-full text-xs font-bold border ${s.border}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  if (loading) return <div className="p-12 text-center text-slate-600">Loading applications...</div>;

  if (applications.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-slate-300 rounded-xl bg-white">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-navy-900 font-bold text-lg">No applications yet</p>
        <p className="text-slate-500 mt-2">Browse the Job Board and apply to positions that match your skills.</p>
      </div>
    );
  }

  // Group by status for visual clarity
  const shortlisted = applications.filter(a => a.status === 'SHORTLISTED');
  const pending = applications.filter(a => a.status === 'APPLIED');
  const rejected = applications.filter(a => a.status === 'REJECTED');
  const grouped = [...shortlisted, ...pending, ...rejected];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-navy-900">Your Applications</h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{applications.length} total</span>
          {shortlisted.length > 0 && <span className="text-green-600 font-semibold">{shortlisted.length} shortlisted</span>}
          {pending.length > 0 && <span className="text-blue-600 font-semibold">{pending.length} under review</span>}
        </div>
      </div>

      {grouped.map(app => (
        <div key={app.id} className={`bg-white border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-ambient ${
          app.status === 'SHORTLISTED' ? 'border-green-200 shadow-card' : 
          app.status === 'REJECTED' ? 'border-slate-200 opacity-60' : 
          'border-slate-300/40 shadow-card'
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="font-semibold text-navy-900">{app.job_title}</h3>
              <StatusBadge status={app.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {app.company_name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
            </div>
            {app.status === 'SHORTLISTED' && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                🎉 Congratulations! The recruiter has shortlisted you for this position.
              </p>
            )}
            {app.status === 'REJECTED' && (
              <p className="text-sm text-slate-400 mt-2">
                This application was not selected. Keep applying to other roles!
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 hidden sm:block flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
