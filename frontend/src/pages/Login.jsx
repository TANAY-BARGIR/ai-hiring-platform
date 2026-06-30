import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { role } = await login(email, password);
      if (role === 'CANDIDATE') {
        navigate('/candidate');
      } else {
        navigate('/recruiter');
      }
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Nexus AI</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-ambient border border-slate-300/40 p-8">
          {/* Blue accent line at top of card */}
          <div className="w-full h-1 bg-blue-600 rounded-full -mt-8 mb-8 mx-auto" style={{ marginTop: '-33px', marginBottom: '24px', borderRadius: '0 0 0 0' }}></div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-600 mb-6">Please enter your details to sign in.</p>
          
          {error && <div className="bg-red-50 text-danger text-sm font-medium p-3 rounded-lg mb-4 border border-red-200">{error}</div>}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all" 
                />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-sm">
              Sign In
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
