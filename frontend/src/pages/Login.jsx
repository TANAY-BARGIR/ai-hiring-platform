import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Nexus AI account</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button type="button" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold mt-2 hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
