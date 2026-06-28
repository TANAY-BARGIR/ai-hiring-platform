import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('CANDIDATE');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    company_name: '',
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
      // Auto-generate username from email (backend requires it)
      dataToSubmit.username = formData.email.split('@')[0] + Math.random().toString(36).slice(-4);
      await register(dataToSubmit);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        // Django DRF returns errors as { field: ["msg"] } 
        const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(messages.join(' | '));
      } else {
        setError('Registration failed. Check your inputs.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Join Nexus AI</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>
        
        <div className="flex bg-background/50 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'CANDIDATE' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            I'm a Candidate
          </button>
          <button 
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'RECRUITER' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            I'm a Recruiter
          </button>
        </div>

        {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          
          {role === 'RECRUITER' && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
          </div>
          
          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold mt-4 hover:opacity-90 transition-opacity">
            Create Account
          </button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
