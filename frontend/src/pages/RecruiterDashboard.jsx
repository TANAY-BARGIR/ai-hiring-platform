import { useState } from 'react';
import { Search, SlidersHorizontal, MessageSquare, MapPin, Briefcase } from 'lucide-react';

export default function RecruiterDashboard() {
  const [query, setQuery] = useState('Python developer with cloud deployment experience');
  
  const results = [
    { id: 1, name: "Tanay Bargir", location: "Bangalore, India", exp: 4, score: 94, skills: ["Python", "Django", "AWS", "Docker", "PostgreSQL", "React"] },
    { id: 2, name: "Sarah Chen", location: "Remote", exp: 5, score: 88, skills: ["Python", "FastAPI", "Kubernetes", "GCP", "Redis"] },
    { id: 3, name: "Michael Rodriguez", location: "New York, NY", exp: 3, score: 81, skills: ["Python", "Flask", "AWS", "CI/CD"] },
  ];

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
            className="w-full bg-card/60 border border-white/10 rounded-2xl py-5 pl-14 pr-32 text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg backdrop-blur-sm transition-all"
            placeholder="Describe the ideal candidate in natural language..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:opacity-90 transition-opacity">
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">Minimum Experience</label>
                <input type="range" min="0" max="15" defaultValue="3" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0y</span><span>15y+</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="e.g. Bangalore" className="w-full bg-background/50 border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Required Skills</label>
                <input type="text" placeholder="Add skill..." className="w-full bg-background/50 border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-xs flex items-center gap-1">
                    Python <button className="hover:text-primary-foreground">&times;</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Results Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Semantic Matches</h2>
            <span className="text-sm text-muted-foreground">{results.length} candidates found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((candidate) => (
              <div key={candidate.id} className="bg-card/40 border border-white/5 rounded-2xl p-6 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 group cursor-pointer flex flex-col h-full relative overflow-hidden">
                
                {/* Match Score Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary/20 to-transparent p-4 pl-6 pb-6 rounded-bl-3xl">
                  <span className="text-primary font-bold">{candidate.score}% Match</span>
                </div>

                <div className="mb-4 pr-20">
                  <h3 className="text-xl font-semibold text-foreground">{candidate.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {candidate.exp} Years</span>
                  </div>
                </div>

                <div className="mb-6 flex-grow">
                  <p className="text-xs font-medium text-muted-foreground mb-2">VERIFIED SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                      <span key={skill} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs font-medium text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">View Profile</button>
                  <button className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <MessageSquare className="w-4 h-4" /> Ask Resume
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
