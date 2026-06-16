import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-8 py-4">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">Nexus AI</Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/recruiter" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Recruiter</Link>
            <Link to="/candidate" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Candidate</Link>
          </div>
          
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-primary hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition-all duration-300">Sign In</Link>
            <Link to="/register" className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary),0.3)]">Join Nexus</Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow pt-[80px]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
