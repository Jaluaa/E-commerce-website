import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const categories = ['Electronics', 'Fashion', 'Accessories', 'Home essentials'];

  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 100, backdropFilter: 'blur(2px)',
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px',
        background: 'rgba(15,23,42,0.98)', borderRight: '1px solid rgba(255,255,255,0.1)',
        zIndex: 101, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NexusShop</span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        {user && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {user.email[0].toUpperCase()}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Signed in as</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        )}

        {/* Search in sidebar (mobile) */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem',
                borderRadius: '0.5rem', background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
          </div>
        </form>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Navigation</p>
          {[{ to: '/', label: '🏠 Home' }, { to: '/products', label: '🛍️ All Products' }, { to: '/cart', label: `🛒 Cart${cartCount > 0 ? ` (${cartCount})` : ''}` }].map(link => (
            <Link key={link.to} to={link.to} style={{ display: 'block', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '0.25rem', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{link.label}</Link>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Categories</p>
          {categories.map(cat => (
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} style={{ display: 'block', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >→ {cat}</Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          {user ? (
            <button onClick={handleLogout} className="btn btn-danger btn-block">Logout</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-primary btn-block" style={{ textAlign: 'center' }}>Login</Link>
              <Link to="/signup" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', display: 'block' }}>Sign up</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Topbar */}
      <nav className="navbar glass" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none', transition: 'box-shadow 0.3s' }}>
        <div className="container nav-container">

          {/* Left: hamburger + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '1.4rem', lineHeight: 1, padding: '4px' }} aria-label="Open menu">☰</button>
            <Link to="/" className="nav-logo">NexusShop</Link>
          </div>

          {/* Right: search + cart + user — pushed to right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>

            {/* Search bar — hidden on mobile, shown on tablet+ */}
            <form onSubmit={handleSearch} className="nav-search-form">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="nav-search-input"
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }}>🔍</span>
              </div>
            </form>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '1.4rem', textDecoration: 'none', flexShrink: 0 }}>
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: 'var(--accent-color)', color: 'white',
                  borderRadius: '50%', width: '20px', height: '20px',
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </Link>

            {/* User avatar or auth links */}
            {user ? (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }} title={user.email}>
                {user.email[0].toUpperCase()}
              </div>
            ) : (
              <div className="nav-auth-links">
                <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none', whiteSpace: 'nowrap' }}>Login</Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;