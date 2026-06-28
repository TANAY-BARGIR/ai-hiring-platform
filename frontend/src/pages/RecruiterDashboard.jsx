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

  // Resume Chat Modal state
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
      const payload = {
        query: query.trim(),
        top_k: 20,
      };
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // --- Resume Chat ---
  const openChat = (candidate) => {
    // Find the first resume from the candidate's resumes array
    const resumeId = candidate.resumes?.[0]?.id;
    if (!resumeId) {
      alert('This candidate has no processed resumes to chat with.');
      return;
    }
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
      const res = await client.post('search/ask-resume/', {
        resume_id: chatResumeId,
        question,
      });
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.source_chunks || [],
        chunksUsed: res.data.num_chunks_used || 0,
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to get a response. The AI service may be unavailable.',
        sources: [],
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const chatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col min-h-[calc(100vh-80px)]">
      
      {/* Header & Main Search Bar */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Discover Top Talent</h1>
        <div className="relative max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-card/60 border border-white/10 rounded-2xl py-5 pl-14 pr-32 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg backdrop-blur-sm transition-all"
            placeholder="Describe the ideal candidate in natural language..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button 
              onClick={handleSearch} 
              disabled={searching || !query.trim()}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
        
        {/* Left Sidebar - Hard Filters */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-card/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md sticky top-28">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Hard Filters</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Minimum Experience: <span className="text-foreground font-semibold">{minExp}y</span>
                </label>
                <input 
                  type="range" min="0" max="15" value={minExp} 
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="w-full accent-primary" 
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0y</span><span>15y+</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore" 
                    className="w-full bg-background/50 border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Required Skills</label>
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type & press Enter..." 
                  className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 mb-2" 
                />
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-xs flex items-center gap-1">
                      {skill} 
                      <button onClick={() => removeSkill(skill)} className="hover:text-primary-foreground ml-0.5">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Results Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Semantic Matches</h2>
            {searched && <span className="text-sm text-muted-foreground">{totalResults} candidate{totalResults !== 1 ? 's' : ''} found</span>}
          </div>

          {!searched && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">Describe your ideal candidate above</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Our AI will find the best semantic matches from indexed resumes</p>
            </div>
          )}

          {searched && results.length === 0 && !searching && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl bg-card/20">
              <p className="text-muted-foreground text-lg">No matching candidates found</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Try a different query or relax the filters</p>
            </div>
          )}

          {searching && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Searching resumes with AI...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!searching && results.map((candidate) => (
              <div key={candidate.id} className="bg-card/40 border border-white/5 rounded-2xl p-6 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden">
                
                {/* Match Score Badge */}
                {candidate.similarity_score > 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary/20 to-transparent p-4 pl-6 pb-6 rounded-bl-3xl">
                    <span className="text-primary font-bold">{Math.round(candidate.similarity_score * 100)}% Match</span>
                  </div>
                )}

                <div className="mb-4 pr-20">
                  <h3 className="text-xl font-semibold text-foreground">
                    {candidate.user?.first_name} {candidate.user?.last_name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {candidate.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {candidate.years_of_experience || 0} Years</span>
                  </div>
                </div>

                <div className="mb-6 flex-grow">
                  <p className="text-xs font-medium text-muted-foreground mb-2">VERIFIED SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills || []).map(skill => (
                      <span key={skill.id || skill.name} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs font-medium text-foreground">
                        {skill.name || skill}
                      </span>
                    ))}
                    {(!candidate.skills || candidate.skills.length === 0) && (
                      <span className="text-xs text-muted-foreground">No skills extracted yet</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{candidate.resumes?.length || 0} resume(s)</span>
                  <button 
                    onClick={() => openChat(candidate)}
                    className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Ask Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============ Resume Chat Modal ============ */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-white/10 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="font-semibold text-lg">Chat with Resume</h3>
                <p className="text-xs text-muted-foreground">{chatCandidateName}'s resume · Powered by RAG</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Ask questions about this candidate's resume.</p>
                  <p className="text-xs mt-1 opacity-60">e.g. "Does this person have microservices experience?"</p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-card/60 border border-white/10 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Source Excerpts */}
                    {msg.sources && msg.sources.length > 0 && (
                      <details className="mt-3 border-t border-white/10 pt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground">
                          <ChevronDown className="w-3 h-3" />
                          {msg.chunksUsed} source excerpt{msg.chunksUsed !== 1 ? 's' : ''} used
                        </summary>
                        <div className="mt-2 space-y-2">
                          {msg.sources.map((src, j) => (
                            <div key={j} className="bg-background/50 border border-white/5 rounded-lg p-2 text-xs text-muted-foreground leading-relaxed">
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
                  <div className="bg-card/60 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="px-6 py-4 border-t border-white/10">
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={chatKeyDown}
                  placeholder="Ask about this resume..."
                  className="flex-1 bg-card/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={chatLoading}
                />
                <button 
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-primary text-primary-foreground px-4 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
