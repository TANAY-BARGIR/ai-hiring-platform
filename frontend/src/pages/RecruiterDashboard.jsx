import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MessageSquare, MapPin, Briefcase, X, Send, ChevronDown, Loader2, Plus, Users, FileText, Clock } from 'lucide-react';
import client from '../api/client';

// ─── Tab: Search Talent ───
function SearchTab() {
  const [query, setQuery] = useState('');
  const [minExp, setMinExp] = useState(0);
  const [location, setLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatResumeId, setChatResumeId] = useState(null);
  const [chatCandidateName, setChatCandidateName] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setSearched(true);
    try {
      const payload = { query: query.trim(), top_k: 20 };
      if (minExp > 0) payload.min_experience = minExp;
      if (location.trim()) payload.location = location.trim();
      if (skills.length > 0) payload.skills = skills;
      const res = await client.post('search/', payload);
      setResults(res.data.results || []); setTotalResults(res.data.total || 0);
    } catch { setResults([]); setTotalResults(0); }
    finally { setSearching(false); }
  };

  const addSkill = (e) => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]); setSkillInput(''); } };

  const openChat = (c) => {
    const rid = c.resumes?.[0]?.id;
    if (!rid) { alert('No processed resumes to chat with.'); return; }
    setChatResumeId(rid);
    setChatCandidateName(`${c.user?.first_name || ''} ${c.user?.last_name || ''}`.trim() || 'Candidate');
    setChatMessages([]); setChatOpen(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMessages(p => [...p, { role: 'user', content: q }]); setChatLoading(true);
    try {
      const res = await client.post('search/ask-resume/', { resume_id: chatResumeId, question: q });
      setChatMessages(p => [...p, { role: 'assistant', content: res.data.answer, sources: res.data.source_chunks || [], chunksUsed: res.data.num_chunks_used || 0 }]);
    } catch { setChatMessages(p => [...p, { role: 'assistant', content: 'Failed to get a response.', sources: [] }]); }
    finally { setChatLoading(false); }
  };

  const inp = "w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30";

  return (
    <>
      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-28 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 shadow-card"
            placeholder="Describe your ideal candidate..." />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button onClick={handleSearch} disabled={searching || !query.trim()}
              className="bg-navy-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
              {searching && <Loader2 className="w-4 h-4 animate-spin" />} Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white border border-slate-300/40 shadow-card rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" /><h2 className="font-semibold text-navy-900 text-sm">Refine Search</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Experience: <span className="text-blue-600 font-semibold">{minExp}+ years</span></label>
                <input type="range" min="0" max="15" value={minExp} onChange={e => setMinExp(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
                <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote" className={`${inp} !pl-9`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Required Skills</label>
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type & Enter..." className={`${inp} mb-2`} />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => <span key={s} className="bg-blue-50 text-navy-900 border border-blue-200 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">{s} <button onClick={() => setSkills(skills.filter(x => x !== s))} className="ml-0.5">&times;</button></span>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-navy-900">{searched ? `Found ${totalResults} matches` : 'Semantic Matches'}</h2>
          </div>
          {!searched && <div className="flex flex-col items-center py-20 text-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8 text-slate-300" /></div><p className="text-navy-900 font-semibold">Describe your ideal candidate above</p><p className="text-slate-400 text-sm mt-1">Our AI will find the best semantic matches</p></div>}
          {searched && !results.length && !searching && <div className="py-20 text-center border border-dashed border-slate-300 rounded-xl bg-white"><p className="text-navy-900 font-semibold">No matches found</p></div>}
          {searching && <div className="flex flex-col items-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" /><p className="text-navy-900 font-medium">Searching...</p></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {!searching && results.map(c => (
              <div key={c.id} className="bg-white border border-slate-300/40 shadow-card rounded-xl p-5 hover:shadow-ambient transition-all flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold">{(c.user?.first_name?.[0]||'')}{(c.user?.last_name?.[0]||'')}</div>
                    <div><h3 className="font-semibold text-navy-900">{c.user?.first_name} {c.user?.last_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">{c.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.location}</span>}<span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" />{c.years_of_experience||0}y</span></div>
                    </div>
                  </div>
                  {c.similarity_score > 0 && <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full border border-green-200">{Math.round(c.similarity_score*100)}%</span>}
                </div>
                <div className="mb-4 flex-grow"><p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">{(c.skills||[]).slice(0,6).map(s=><span key={s.id||s.name} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-900">{s.name||s}</span>)}</div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button onClick={() => openChat(c)} className="flex items-center gap-1.5 bg-navy-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors"><MessageSquare className="w-3.5 h-3.5" />Chat Resume</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div><h3 className="font-bold text-lg text-navy-900">Chat with Resume</h3><p className="text-xs text-slate-400">{chatCandidateName} · RAG</p></div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {!chatMessages.length && <div className="text-center py-16 text-slate-400"><MessageSquare className="w-10 h-10 mx-auto mb-3" /><p className="text-sm">Ask about this resume</p></div>}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 border border-slate-200 rounded-bl-sm text-slate-900'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.sources?.length > 0 && <details className="mt-3 border-t border-slate-200/50 pt-2"><summary className="text-xs text-slate-400 cursor-pointer"><ChevronDown className="w-3 h-3 inline" /> {m.chunksUsed} sources</summary><div className="mt-2 space-y-1">{m.sources.map((s,j)=><div key={j} className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-600">"{s}"</div>)}</div></details>}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="flex justify-start"><div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div></div>}
            </div>
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex gap-3">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ask about this resume..." className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" disabled={chatLoading} />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="bg-navy-900 text-white px-4 py-3 rounded-xl hover:bg-navy-800 disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Tab: My Jobs ───
function JobsTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', min_experience: 0, required_skills: '', status: 'ACTIVE' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatResumeId, setChatResumeId] = useState(null);
  const [chatCandidateName, setChatCandidateName] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchJobs = async () => {
    try { const res = await client.get('jobs/my-jobs/'); setJobs(res.data.results || res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const createJob = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, min_experience: Number(form.min_experience), required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean) };
      await client.post('jobs/create/', payload);
      setShowForm(false); setForm({ title: '', description: '', location: '', min_experience: 0, required_skills: '', status: 'ACTIVE' });
      fetchJobs();
    } catch (err) { alert('Failed to create job: ' + JSON.stringify(err.response?.data || err.message)); }
    finally { setSaving(false); }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job); setAppsLoading(true);
    try { 
      const res = await client.get(`jobs/${job.id}/applications/`); 
      let apps = res.data.results || res.data;
      
      try {
        const searchRes = await client.post('search/', { query: job.title, top_k: 50 });
        const aiMatches = searchRes.data.results || [];
        const scoreMap = {};
        aiMatches.forEach(match => {
          if (match.id) scoreMap[match.id] = match.similarity_score;
        });
        apps = apps.map(app => ({
          ...app,
          relevance: scoreMap[app.candidate_id] || 0
        }));
        apps.sort((a, b) => b.relevance - a.relevance);
      } catch (err) {
        console.error("AI ranking failed for applications", err);
      }
      
      setApplications(apps); 
    } catch { setApplications([]); }
    finally { setAppsLoading(false); }
  };

  const openChat = (app) => {
    if (!app.resume) { alert('No processed resume to chat with.'); return; }
    setChatResumeId(app.resume);
    setChatCandidateName(app.candidate_name || 'Candidate');
    setChatMessages([]); setChatOpen(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim(); setChatInput('');
    setChatMessages(p => [...p, { role: 'user', content: q }]); setChatLoading(true);
    try {
      const res = await client.post('search/ask-resume/', { resume_id: chatResumeId, question: q });
      setChatMessages(p => [...p, { role: 'assistant', content: res.data.answer, sources: res.data.source_chunks || [], chunksUsed: res.data.num_chunks_used || 0 }]);
    } catch { setChatMessages(p => [...p, { role: 'assistant', content: 'Failed to get a response.', sources: [] }]); }
    finally { setChatLoading(false); }
  };

  const updateAppStatus = async (appId, newStatus) => {
    try { await client.patch(`jobs/applications/${appId}/status/`, { status: newStatus }); viewApplications(selectedJob); } catch (e) { alert('Failed: ' + (e.response?.data?.status || e.message)); }
  };

  const inp = "w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

  if (loading) return <div className="py-20 text-center text-slate-400">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-navy-900">My Job Postings</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Create Job Form */}
      {showForm && (
        <form onSubmit={createJob} className="bg-white border border-slate-300/40 shadow-card rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-navy-900 mb-2">New Job Posting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-900 mb-1">Job Title *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Frontend Engineer" className={inp} /></div>
            <div><label className="block text-sm font-medium text-slate-900 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Remote / Bangalore" className={inp} /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-900 mb-1">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the role, responsibilities..." className={`${inp} resize-none`} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-900 mb-1">Min Experience (years)</label>
              <input type="number" min={0} value={form.min_experience} onChange={e => setForm({...form, min_experience: e.target.value})} className={inp} /></div>
            <div><label className="block text-sm font-medium text-slate-900 mb-1">Required Skills (comma-separated)</label>
              <input value={form.required_skills} onChange={e => setForm({...form, required_skills: e.target.value})} placeholder="React, Django, PostgreSQL" className={inp} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Publish Job
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-white border border-slate-300 text-slate-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Job List */}
      {!jobs.length && !showForm && (
        <div className="py-16 text-center border border-dashed border-slate-300 rounded-xl bg-white">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-navy-900 font-semibold">No jobs posted yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Post New Job" to create your first listing</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map(job => (
          <div key={job.id} className={`bg-white border shadow-card rounded-xl p-5 transition-all ${selectedJob?.id === job.id ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-300/40 hover:shadow-ambient'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-navy-900">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{job.company_name} · {job.location || 'No location'}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${job.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : job.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{job.status}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(job.required_skills || []).map(s => <span key={s.id} className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium text-navy-900">{s.name}</span>)}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" />{job.application_count || 0} applicants</span>
                <button onClick={() => viewApplications(job)} className="text-xs font-semibold text-blue-600 hover:underline">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Panel */}
      {selectedJob && (
        <div className="bg-white border border-slate-300/40 shadow-card rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-navy-900">Applications for: {selectedJob.title}</h3>
            <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
          </div>
          {appsLoading ? <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></div> :
            !applications.length ? <p className="py-8 text-center text-slate-400">No applications yet.</p> :
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-navy-900">{app.candidate_name}</p>
                        {app.relevance > 0 && <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">{Math.round(app.relevance*100)}% Match</span>}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-600 border-blue-200' : app.status === 'SHORTLISTED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{app.status}</span>
                      </div>
                      <p className="text-xs text-slate-500">{app.candidate_email} · Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        {app.candidate_location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {app.candidate_location}</span>}
                        {app.candidate_experience !== undefined && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-400" /> {app.candidate_experience} Years Exp.</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button onClick={() => openChat(app)} className="flex items-center gap-1.5 text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 px-3 py-1.5 rounded-md transition-colors"><MessageSquare className="w-3.5 h-3.5" /> Chat Resume</button>
                      {app.resume_url && (
                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
                          View Resume
                        </a>
                      )}
                      {app.status === 'APPLIED' && <>
                        <button onClick={() => updateAppStatus(app.id, 'SHORTLISTED')} className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors">Shortlist</button>
                        <button onClick={() => updateAppStatus(app.id, 'REJECTED')} className="text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">Reject</button>
                      </>}
                    </div>
                  </div>
                  
                  {app.candidate_skills && app.candidate_skills.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">AI Extracted Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.candidate_skills.map((skill, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      )}
      
      {/* Chat Modal for JobsTab */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div><h3 className="font-bold text-lg text-navy-900">Chat with Resume</h3><p className="text-xs text-slate-400">{chatCandidateName} · RAG</p></div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {!chatMessages.length && <div className="text-center py-16 text-slate-400"><MessageSquare className="w-10 h-10 mx-auto mb-3" /><p className="text-sm">Ask about this resume</p></div>}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 border border-slate-200 rounded-bl-sm text-slate-900'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.sources?.length > 0 && <details className="mt-3 border-t border-slate-200/50 pt-2"><summary className="text-xs text-slate-400 cursor-pointer"><ChevronDown className="w-3 h-3 inline" /> {m.chunksUsed} sources</summary><div className="mt-2 space-y-1">{m.sources.map((s,j)=><div key={j} className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-600">"{s}"</div>)}</div></details>}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="flex justify-start"><div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div></div>}
            </div>
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex gap-3">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ask about this resume..." className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30" disabled={chatLoading} />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="bg-navy-900 text-white px-4 py-3 rounded-xl hover:bg-navy-800 disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───
export default function RecruiterDashboard() {
  const [tab, setTab] = useState('search');

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Recruiter Dashboard</h1>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setTab('search')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'search' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              <Search className="w-4 h-4 inline mr-1.5 -mt-0.5" />Search Talent
            </button>
            <button onClick={() => setTab('jobs')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'jobs' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />My Jobs
            </button>
          </div>
        </div>
        {tab === 'search' ? <SearchTab /> : <JobsTab />}
      </div>
    </div>
  );
}
