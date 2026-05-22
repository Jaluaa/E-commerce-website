import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const RULES = [
  { id: 'len',   test: p => p.length >= 8,          label: 'At least 8 characters' },
  { id: 'upper', test: p => /[A-Z]/.test(p),         label: 'One uppercase letter (A–Z)' },
  { id: 'num',   test: p => /[0-9]/.test(p),         label: 'One number (0–9)' },
  { id: 'sym',   test: p => /[^A-Za-z0-9]/.test(p),  label: 'One special character (!@#$...)' },
];

const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#22c55e', '#8b5cf6'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];

function Signup() {
  const location = useLocation();
  const [email, setEmail]       = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Verification states
  const [showVerification, setShowVerification] = useState(location.state?.showVerify || false);
  const [otpCode, setOtpCode]                   = useState('');
  const [verifyError, setVerifyError]           = useState('');
  const [verifySuccess, setVerifySuccess]       = useState('');

  const { register, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  const score = RULES.filter(r => r.test(password)).length;
  const passwordsMatch = password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (score < 4) { setError('Please meet all password requirements.'); return; }
    if (!passwordsMatch) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(email, password);
      // Succeeded, now transition to OTP step
      setShowVerification(true);
      setVerifySuccess('Verification code has been successfully sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifySuccess('');
    
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setVerifyError('Please enter a valid 6-digit numeric code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, otpCode);
      setVerifySuccess('Email verified successfully! Unlocking your portal...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setVerifyError(err.response?.data?.error || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerifyError('');
    setVerifySuccess('');
    try {
      await resendCode(email);
      setVerifySuccess('A fresh 6-digit verification code has been dispatched to your email address!');
    } catch (err) {
      setVerifyError(err.response?.data?.error || 'Failed to resend verification code.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      {/* Back to Home Button */}
      <div className="mb-6 w-full max-w-md text-left">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md premium-card rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col gap-6 relative">
        {!showVerification ? (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">Join the FandomRealm store portal</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 rounded-xl premium-input text-white placeholder-slate-500 transition-all text-sm"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none text-slate-400 hover:text-white cursor-pointer text-lg"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength bars */}
                <div className="flex gap-1.5 mt-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
                      background: i < score ? STRENGTH_COLORS[score] : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{
                  color: password ? STRENGTH_COLORS[score] : '#64748b',
                }}>
                  {password ? STRENGTH_LABELS[score] : 'Enter a password'}
                </div>

                {/* Rules checklist */}
                <div className="mt-2 flex flex-col gap-1">
                  {RULES.map(r => (
                    <div key={r.id} className="text-xs flex items-center gap-2 transition-all duration-200" style={{
                      color: r.test(password) ? '#22c55e' : '#64748b',
                    }}>
                      <span>{r.test(password) ? '✓' : '○'}</span>
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showCf ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 rounded-xl premium-input text-white placeholder-slate-500 transition-all text-sm"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none text-slate-400 hover:text-white cursor-pointer text-lg"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showCf ? '🙈' : '👁️'}
                  </button>
                </div>
                {confirm && (
                  <div className="text-xs font-semibold mt-1" style={{
                    color: passwordsMatch ? '#22c55e' : '#ef4444',
                  }}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 hover:shadow-blue-500/30 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                style={{ opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:underline font-semibold transition-all">Login</Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Verify Portal Entry
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
                We have dispatched a 6-digit verification code to:<br />
                <strong className="text-slate-200 text-sm font-bold block mt-1">{email}</strong>
              </p>
            </div>

            {verifyError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 text-center">
                {verifyError}
              </div>
            )}

            {verifySuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-400 text-center">
                {verifySuccess}
              </div>
            )}

            <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3.5 rounded-xl premium-input text-white placeholder-slate-600 transition-all text-center text-2xl tracking-[12px] font-black"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 hover:shadow-blue-500/30 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                style={{ opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? 'Verifying access...' : 'Verify & Unlock ✨'}
              </button>
            </form>

            <div className="flex justify-between items-center text-xs mt-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer bg-none border-none"
              >
                Resend Code 📬
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setOtpCode('');
                  setVerifyError('');
                  setVerifySuccess('');
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer bg-none border-none"
              >
                ← Back to Edit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;