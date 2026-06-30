import { Link } from 'react-router-dom';
import { FileUp, Search, FileText, MessageSquare, UploadCloud, Cpu, Shield, Database, BrainCircuit } from 'lucide-react';

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuB9FluBcvl6WHi_Lg5tBXPdmg5wh-5UD6aEI8JrCTUe4ubKsIVDQq5wWOfsYNp2OTFnyQG_d_v4wseEssFYMfB12110qG-16dEuCyssp6FdKV2wWEw0vux1kdp-JOCKzogAkmLMi1lmAyPztX6duXoqc5MurLbnIgJfqX4JErAEUAkwOCyBeVBuF-SWLY7UwX34g0if6LybfQXJOkqWakHLRygjre-GkfyJfh-Tm3pUw5AoM5zNMCwVd-LHbnnQppPja_0Z7X8PUixV";

export default function Landing() {
  return (
    <div className="w-full bg-slate-50">

      {/* ─── Hero Section ─── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 leading-tight tracking-tight">
              Discover the Right Talent, Faster
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Leverage AI semantic search to instantly connect with candidates who truly fit. Skip keyword matching and understand the actual context of every resume.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/register" className="bg-blue-600 text-white font-medium px-8 py-3 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors shadow-sm">
                Start Hiring
              </Link>
              <Link to="/login" className="bg-white text-navy-900 border border-slate-300 font-medium px-8 py-3 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors gap-2">
                <FileUp className="w-5 h-5" />
                Upload Resume
              </Link>
            </div>
          </div>

          {/* Hero Image from Stitch AI */}
          <div className="relative h-[380px] lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-ambient border border-slate-300/40">
            <img 
              src={HERO_IMAGE} 
              alt="Nexus AI — a clean, modern talent intelligence dashboard with candidate profile cards and data visualizations"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ─── Tech Stack Bar (real technologies) ─── */}
      <section className="border-y border-slate-300/50 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Built with</p>
          <div className="flex flex-wrap justify-center gap-8 items-center text-slate-600">
            <span className="flex items-center gap-2 text-sm font-medium"><BrainCircuit className="w-5 h-5 text-blue-600" /> Llama 3.1</span>
            <span className="flex items-center gap-2 text-sm font-medium"><Database className="w-5 h-5 text-blue-600" /> FAISS + PostgreSQL</span>
            <span className="flex items-center gap-2 text-sm font-medium"><Cpu className="w-5 h-5 text-blue-600" /> NVIDIA NIM</span>
            <span className="flex items-center gap-2 text-sm font-medium"><Shield className="w-5 h-5 text-blue-600" /> Django + FastAPI</span>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 mb-3">Intelligence at Every Step</h2>
          <p className="text-lg text-slate-600">Move beyond boolean searches. Nexus AI understands context, skills, and potential.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-card border border-slate-300/30 flex flex-col gap-4 group hover:shadow-ambient transition-shadow duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-navy-900 group-hover:scale-110 transition-transform duration-300">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900">Semantic Search</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Query your talent pool using natural language. The AI understands intent, not just exact keywords, uncovering hidden gems.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-card border border-slate-300/30 flex flex-col gap-4 group hover:shadow-ambient transition-shadow duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900">Resume Intelligence</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Instantly parse and normalize complex resumes into standardized, comparable data structures, regardless of formatting.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-card border border-slate-300/30 flex flex-col gap-4 group hover:shadow-ambient transition-shadow duration-300">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-success group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900">Resume Chat</h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Ask questions about any candidate's resume and get instant, grounded answers powered by RAG.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-white py-24 border-y border-slate-300/30">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy-900 mb-3">How It Works</h2>
            <p className="text-base text-slate-600">Three steps to a smarter hiring pipeline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-300/40 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">1</div>
              <h3 className="text-xl font-semibold text-navy-900">Upload Resume</h3>
              <p className="text-base text-slate-600">Candidates upload their PDF resumes. The system accepts any formatting.</p>
              <div className="mt-auto h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white">
                <UploadCloud className="w-8 h-8 text-slate-400" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-300/40 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">2</div>
              <h3 className="text-xl font-semibold text-navy-900">AI Processing</h3>
              <p className="text-base text-slate-600">Llama 3.1 extracts skills, experience, and context. Embeddings are indexed in FAISS.</p>
              <div className="mt-auto flex items-center justify-center h-20">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-2 border-navy-900/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-3 border-2 border-blue-600/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-navy-900" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-300/40 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">3</div>
              <h3 className="text-xl font-semibold text-navy-900">Search & Chat</h3>
              <p className="text-base text-slate-600">Recruiters search using natural language and chat with any resume for deeper insights.</p>
              <div className="mt-auto h-20 bg-navy-900/5 rounded-xl flex items-center px-4 gap-2">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-600 truncate">Find backend dev with Django exp...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ backgroundColor: '#022448', color: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold">Nexus AI</span>
            <p className="text-sm opacity-70">Transforming talent discovery with artificial intelligence.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold mb-1">Product</span>
            <Link to="/register" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Start Hiring</Link>
            <Link to="/login" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Upload Resume</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold mb-1">Technology</span>
            <span className="text-sm opacity-70">Django + FastAPI</span>
            <span className="text-sm opacity-70">NVIDIA NIM / Llama 3.1</span>
            <span className="text-sm opacity-70">FAISS Vector Search</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold mb-1">Legal</span>
            <span className="text-sm opacity-70">MIT License</span>
          </div>
          <div className="col-span-1 md:col-span-4 mt-4 pt-4 border-t border-white/20">
            <span className="text-sm opacity-50">© 2026 Nexus AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
