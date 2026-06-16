import { useState } from 'react';
import { UploadCloud, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function CandidateDashboard() {
  const [resumes, setResumes] = useState([
    { id: 1, name: "john_doe_resume_2026.pdf", status: "READY", skills: ["React", "Django", "PostgreSQL", "Docker", "AWS"], date: "2 days ago" },
    { id: 2, name: "old_resume_2024.pdf", status: "PENDING", skills: [], date: "Just now" }
  ]);

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'READY': return <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/20"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>;
      case 'PROCESSING': return <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-medium border border-blue-400/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing</span>;
      case 'PENDING': return <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-medium border border-yellow-400/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'FAILED': return <span className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-medium border border-red-400/20"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default: return null;
    }
  };

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
                <div className="font-medium">John Doe</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                <div className="font-medium">San Francisco, CA</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Years of Experience</label>
                <div className="font-medium">4 Years</div>
              </div>
              <button className="w-full mt-2 py-2 border border-border rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload New Resume</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mb-6">Drag and drop your PDF here, or click to browse files.</p>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Select File
            </button>
          </div>

        </div>

        {/* Right Column - Resumes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Your Resumes</h2>
          
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-card/40 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all hover:bg-card/60">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{resume.name}</h3>
                    <StatusBadge status={resume.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Uploaded {resume.date}</p>
                  
                  {resume.status === "READY" && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">EXTRACTED SKILLS</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map(skill => (
                          <span key={skill} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs font-medium text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resume.status === "PENDING" && (
                    <p className="text-sm text-yellow-400/80">Waiting in queue to be processed by AI...</p>
                  )}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                    View
                  </button>
                  <button className="flex-1 sm:flex-none border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
