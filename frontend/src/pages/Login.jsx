import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container">
      <div className="form-container glass">
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Login</button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#cbd5e1' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
