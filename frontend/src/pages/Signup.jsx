import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RULES = [
  { id: 'len',   test: p => p.length >= 8,          label: 'At least 8 characters' },
  { id: 'upper', test: p => /[A-Z]/.test(p),         label: 'One uppercase letter (A–Z)' },
  { id: 'num',   test: p => /[0-9]/.test(p),         label: 'One number (0–9)' },
  { id: 'sym',   test: p => /[^A-Za-z0-9]/.test(p),  label: 'One special character (!@#$...)' },
];

const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#22c55e', '#8b5cf6'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];

function Signup() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();
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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container glass">
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Create Account
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: '#fca5a5',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem',
                }}
                aria-label="Toggle password visibility"
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength bars */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < score ? STRENGTH_COLORS[score] : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.25s',
                }} />
              ))}
            </div>
            <div style={{
              fontSize: '0.75rem', marginTop: 5, fontWeight: 600,
              color: password ? STRENGTH_COLORS[score] : '#64748b',
            }}>
              {password ? STRENGTH_LABELS[score] : 'Enter a password'}
            </div>

            {/* Rules checklist */}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {RULES.map(r => (
                <div key={r.id} style={{
                  fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6,
                  color: r.test(password) ? '#22c55e' : '#64748b',
                  transition: 'color 0.2s',
                }}>
                  <span>{r.test(password) ? '✓' : '○'}</span>
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCf ? 'text' : 'password'}
                className="form-input"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCf(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem',
                }}
                aria-label="Toggle confirm password visibility"
              >
                {showCf ? '🙈' : '👁️'}
              </button>
            </div>
            {confirm && (
              <div style={{
                fontSize: '0.75rem', marginTop: 5, fontWeight: 500,
                color: passwordsMatch ? '#22c55e' : '#ef4444',
              }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#cbd5e1' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;