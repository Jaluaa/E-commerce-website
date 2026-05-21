import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱', color: '#3b82f6' },
  { name: 'Fashion',     emoji: '👗', color: '#8b5cf6' },
  { name: 'Accessories', emoji: '⌚', color: '#06b6d4' },
  { name: 'Home essentials', emoji: '🏠', color: '#10b981' },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '6rem 1rem',
        background: 'linear-gradient(rgba(15,23,42,0.75),rgba(15,23,42,0.9)), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        borderRadius: '1rem', marginBottom: '3rem',
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.85rem', color: '#93c5fd', marginBottom: '1.25rem' }}>
          ✨ New arrivals every week
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1rem', color: '#fff', lineHeight: 1.2 }}>
          Shop the Future,<br />Today.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Discover state-of-the-art products built for the modern lifestyle.
        </p>

        {/* Search in hero */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, padding: '0.85rem 1.25rem', borderRadius: '0.75rem',
              background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc', fontSize: '1rem', outline: 'none',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem' }}>
            Search
          </button>
        </form>

        <Link to="/products" className="btn" style={{
          padding: '0.85rem 2.5rem', fontSize: '1rem', borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#f8fafc',
        }}>
          Browse All Products →
        </Link>
      </div>

      {/* Categories */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', fontWeight: 700 }}>Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem 1rem', borderRadius: '1rem', textDecoration: 'none',
              background: 'rgba(30,41,59,0.7)', border: `1px solid ${cat.color}33`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              gap: '0.5rem',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}33`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
              <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Featured Products</h2>
          <Link to="/products" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>View all →</Link>
        </div>
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Trust banner */}
      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: '1rem', padding: '2rem', borderRadius: '1rem',
          background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: '↩️', title: 'Easy Returns',  desc: '30-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
            { icon: '💬', title: '24/7 Support',  desc: 'Always here to help' },
          ].map(f => (
            <div key={f.title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{f.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;