import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('CANDIDATE');
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    password: '', password_confirm: '', company_name: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const dataToSubmit = { ...formData, role };
      dataToSubmit.username = formData.email.split('@')[0] + Math.random().toString(36).slice(-4);
      await register(dataToSubmit);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(messages.join(' | '));
      } else {
        setError('Registration failed. Check your inputs.');
      }
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all";

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Nexus AI</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-ambient border border-slate-300/40 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create an Account</h2>
            <p className="text-sm text-slate-600">Join Nexus AI to unlock intelligent hiring.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
            <button 
              type="button" onClick={() => setRole('CANDIDATE')}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${role === 'CANDIDATE' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              I'm a Candidate
            </button>
            <button 
              type="button" onClick={() => setRole('RECRUITER')}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${role === 'RECRUITER' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              I'm a Recruiter
            </button>
          </div>

          {error && <div className="bg-red-50 text-danger text-sm font-medium p-3 rounded-lg mb-4 border border-red-200">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>

            {role === 'RECRUITER' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Company Name</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className={inputClass} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Confirm Password</label>
              <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required className={inputClass} />
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-sm mt-2">
              Create Account
            </button>
          </form>
          
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
