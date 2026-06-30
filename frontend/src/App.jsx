import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 md:px-10 h-16 border-b border-slate-300/50 transition-all duration-300">
      <Link to="/" className="text-xl font-bold text-navy-900 tracking-tight">Nexus AI</Link>
      
      {user ? (
        <div className="flex items-center gap-6">
          {user.role === 'RECRUITER' ? (
            <Link to="/recruiter" className="text-slate-600 font-medium hover:text-blue-600 transition-colors text-sm">Dashboard</Link>
          ) : (
            <Link to="/candidate" className="text-slate-600 font-medium hover:text-blue-600 transition-colors text-sm">Dashboard</Link>
          )}
          <button onClick={logout} className="text-slate-600 font-medium hover:text-blue-600 transition-colors text-sm">Logout</button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:flex text-sm font-medium text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors">Sign In</Link>
          <Link to="/register" className="bg-navy-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-navy-800 transition-colors">Get Started</Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/recruiter" element={<RecruiterDashboard />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
