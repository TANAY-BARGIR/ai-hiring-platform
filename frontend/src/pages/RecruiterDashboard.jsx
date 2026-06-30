import { useState } from 'react';
import { Search, SlidersHorizontal, MessageSquare, MapPin, Briefcase, X, Send, ChevronDown, Loader2 } from 'lucide-react';
import client from '../api/client';

export default function RecruiterDashboard() {
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
    setSearching(true);
    setSearched(true);
    try {
      const payload = { query: query.trim(), top_k: 20 };
      if (minExp > 0) payload.min_experience = minExp;
      if (location.trim()) payload.location = location.trim();
      if (skills.length > 0) payload.skills = skills;
      const res = await client.post('search/', payload);
      setResults(res.data.results || []);
      setTotalResults(res.data.total || 0);
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const openChat = (candidate) => {
    const resumeId = candidate.resumes?.[0]?.id;
    if (!resumeId) { alert('This candidate has no processed resumes to chat with.'); return; }
    setChatResumeId(resumeId);
    setChatCandidateName(`${candidate.user?.first_name || ''} ${candidate.user?.last_name || ''}`.trim() || 'Candidate');
    setChatMessages([]);
    setChatOpen(true);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);
    try {
      const res = await client.post('search/ask-resume/', { resume_id: chatResumeId, question });
      setChatMessages(prev => [...prev, {
        role: 'assistant', content: res.data.answer,
        sources: res.data.source_chunks || [], chunksUsed: res.data.num_chunks_used || 0,
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get a response. The AI service may be unavailable.', sources: [] }]);
    } finally {
      setChatLoading(false);
    }
  };

  const chatKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } };

  const inputClass = "w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30";

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col">
        
        {/* Header & Search Bar */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-navy-900 mb-6">Discover Top Talent</h1>
          <div className="relative max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" value={query}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full bg-white border border-slate-300 rounded-xl py-4 pl-12 pr-28 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 shadow-card transition-all"
              placeholder="Describe your ideal candidate... (e.g., 'Senior Frontend Engineer with fintech exp')"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                onClick={handleSearch} disabled={searching || !query.trim()}
                className="bg-navy-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-grow">
          
          {/* Left Sidebar — Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-slate-300/40 shadow-card rounded-xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <h2 className="font-semibold text-navy-900 text-sm">Refine Search</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Experience: <span className="text-blue-600 font-semibold">{minExp}+ years</span>
                  </label>
                  <input type="range" min="0" max="15" value={minExp} 
                    onChange={(e) => setMinExp(Number(e.target.value))}
                    className="w-full accent-blue-600" />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                    <span>Entry</span><span>Mid</span><span>Senior</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote" className={`${inputClass} !pl-9`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Required Skills</label>
                  <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill} placeholder="Type & press Enter..." className={`${inputClass} mb-2`} />
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(skill => (
                      <span key={skill} className="bg-blue-50 text-navy-900 border border-blue-200 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                        {skill} <button onClick={() => removeSkill(skill)} className="hover:text-danger ml-0.5 text-sm">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-navy-900">
                {searched ? `Found ${totalResults} matches` : 'Semantic Matches'}
              </h2>
            </div>

            {!searched && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-navy-900 font-semibold">Describe your ideal candidate above</p>
                <p className="text-slate-400 text-sm mt-1">Our AI will find the best semantic matches from indexed resumes</p>
              </div>
            )}

            {searched && results.length === 0 && !searching && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 rounded-xl bg-white">
                <p className="text-navy-900 font-semibold">No matching candidates found</p>
                <p className="text-slate-400 text-sm mt-1">Try a different query or relax the filters</p>
              </div>
            )}

            {searching && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-navy-900 font-medium">Searching resumes with AI...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {!searching && results.map((candidate) => (
                <div key={candidate.id} className="bg-white border border-slate-300/40 shadow-card rounded-xl p-5 hover:shadow-ambient hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
                  
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(candidate.user?.first_name?.[0] || '')}{(candidate.user?.last_name?.[0] || '')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900 leading-tight">
                          {candidate.user?.first_name} {candidate.user?.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {candidate.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {candidate.location}</span>}
                          <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" /> {candidate.years_of_experience || 0}y</span>
                        </div>
                      </div>
                    </div>
                    {candidate.similarity_score > 0 && (
                      <span className="bg-green-50 text-success text-xs font-bold px-2 py-1 rounded-full border border-green-200 flex-shrink-0">
                        {Math.round(candidate.similarity_score * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-4 flex-grow">
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Core Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(candidate.skills || []).slice(0, 6).map(skill => (
                        <span key={skill.id || skill.name} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-900">
                          {skill.name || skill}
                        </span>
                      ))}
                      {(!candidate.skills || candidate.skills.length === 0) && (
                        <span className="text-xs italic text-slate-400">No skills extracted</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">{candidate.resumes?.length || 0} resume(s)</span>
                    <button 
                      onClick={() => openChat(candidate)}
                      className="flex items-center gap-1.5 bg-navy-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Resume Chat Modal ─── */}
        {chatOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <h3 className="font-bold text-lg text-navy-900">Chat with Resume</h3>
                  <p className="text-xs text-slate-400 font-medium">{chatCandidateName}'s resume · Powered by RAG</p>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-sm font-medium">Ask questions about this candidate's resume.</p>
                    <p className="text-xs mt-1">e.g. "Does this person have microservices experience?"</p>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-slate-100 border border-slate-200 rounded-bl-sm text-slate-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <details className="mt-3 border-t border-slate-200/50 pt-2">
                          <summary className="text-xs font-semibold text-slate-400 cursor-pointer flex items-center gap-1 hover:text-slate-900">
                            <ChevronDown className="w-3 h-3" />
                            {msg.chunksUsed} source excerpt{msg.chunksUsed !== 1 ? 's' : ''} used
                          </summary>
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((src, j) => (
                              <div key={j} className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-600 leading-relaxed">
                                "{src}"
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white">
                <div className="flex gap-3">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={chatKeyDown} placeholder="Ask about this resume..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                    disabled={chatLoading} />
                  <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
                    className="bg-navy-900 text-white px-4 py-3 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
