import { Link } from 'react-router-dom';
import { Search, MessageSquare, Briefcase, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="w-full max-w-7xl mx-auto px-8 pb-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
        <div className="flex flex-col gap-8 z-10">
          <h1 className="text-5xl md:text-7xl leading-tight font-bold tracking-tight">
            Find Top Talent with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Semantic Search</span><br />
            & Chat with Resumes
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            Nexus AI provides an elite intelligence layer for modern talent acquisition. Discover perfect matches instantly and interact with candidate histories through advanced RAG-powered conversations.
          </p>
          <div className="flex gap-4 mt-2">
            <Link to="/register" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(208,188,255,0.3)]">
              Get Started
            </Link>
            <Link to="/login" className="border border-border text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-white/5 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="relative h-[400px] lg:h-[500px] w-full flex justify-center items-center rounded-2xl overflow-hidden bg-card/50 border border-white/5 backdrop-blur-sm z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
          <div className="relative text-center p-8 bg-background/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
            <Zap className="w-20 h-20 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(208,188,255,0.5)]" />
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Intelligence Layer Active</h3>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-32">
        <h2 className="text-3xl font-bold text-center mb-16">Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/50 border border-white/5 rounded-2xl p-8 flex flex-col gap-4 group transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-2 border border-border group-hover:border-primary/50 transition-colors">
              <Search className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Semantic Match</h3>
            <p className="text-muted-foreground">Find candidates using natural language instead of rigid keywords. Our AI understands context, implied skills, and true experience.</p>
          </div>

          <div className="bg-card/50 border border-white/5 rounded-2xl p-8 flex flex-col gap-4 group transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-2 border border-border group-hover:border-primary/50 transition-colors">
              <MessageSquare className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Resume Chat</h3>
            <p className="text-muted-foreground">Ask questions directly to a candidate's resume using advanced RAG. Get grounded answers with verifiable source excerpts.</p>
          </div>

          <div className="bg-card/50 border border-white/5 rounded-2xl p-8 flex flex-col gap-4 group transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-2 border border-border group-hover:border-primary/50 transition-colors">
              <Briefcase className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Automated Extraction</h3>
            <p className="text-muted-foreground">Upload PDFs and let our Llama 3.1 70B model automatically extract and normalize skills with high confidence.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
