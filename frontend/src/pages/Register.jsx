import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Register() {
  const [role, setRole] = useState('candidate');

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Join Nexus AI</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>
        
        <div className="flex bg-background/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setRole('candidate')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'candidate' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            I'm a Candidate
          </button>
          <button 
            onClick={() => setRole('recruiter')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'recruiter' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            I'm a Recruiter
          </button>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name</label>
              <input type="text" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name</label>
              <input type="text" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          
          {role === 'recruiter' && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Company Name</label>
              <input type="text" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
            <input type="email" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input type="password" className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
          </div>
          
          <button type="button" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold mt-4 hover:opacity-90 transition-opacity">
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
