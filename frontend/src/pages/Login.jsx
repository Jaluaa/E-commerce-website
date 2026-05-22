import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.unverified) {
        setError(err.response.data.error || 'Please verify your email address to unlock your account.');
        setUnverified(true);
      } else {
        setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRedirect = () => {
    navigate('/signup', { state: { email, showVerify: true } });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      {/* Back to Home Button */}
      <div className="mb-6 w-full max-w-md text-left animate-fade-in-up">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md premium-card rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col gap-6 relative animate-fade-in-up delay-75">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Enter your portal credentials</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 text-center flex flex-col gap-2">
            <p className="margin-0 leading-relaxed font-semibold">{error}</p>
            {unverified && (
              <button
                type="button"
                onClick={handleVerifyRedirect}
                className="text-brand-primary hover:text-blue-400 underline font-bold cursor-pointer transition-all self-center text-xs"
              >
                Click here to verify now 📬
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl premium-input text-white placeholder-slate-500 transition-all text-sm" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl premium-input text-white placeholder-slate-500 transition-all text-sm" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 hover:shadow-blue-500/30 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm shimmer-btn" 
            style={{ opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline font-semibold transition-all">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
