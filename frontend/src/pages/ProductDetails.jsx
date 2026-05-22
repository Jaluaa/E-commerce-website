import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading details...</div>;

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleWishlistToggle = () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', paddingTop: '2.5rem', minHeight: '80vh' }}>
      <div style={{ position: 'relative' }}>
        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', maxHeight: '500px', borderRadius: '1.5rem', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
      </div>
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '2rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#93c5fd', width: 'fit-content', marginBottom: '1rem' }}>
          {product.category}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff', lineHeight: 1.2 }}>{product.name}</h1>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
          ${product.price.toFixed(2)}
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          {product.description}
        </p>
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(15,23,42,0.4)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
          <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#94a3b8' }}>Category:</span> <strong style={{ color: '#fff' }}>{product.category}</strong></div>
          <div><span style={{ color: '#94a3b8' }}>In Stock:</span> <strong style={{ color: product.stockQuantity > 0 ? '#10b981' : '#ef4444' }}>{product.stockQuantity > 0 ? `${product.stockQuantity} items` : 'Out of Stock'}</strong></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => addToCart(productId, 1)} 
            style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', borderRadius: '0.75rem' }}
            disabled={product.stockQuantity <= 0}
          >
            {product.stockQuantity > 0 ? 'Add to Cart 🛒' : 'Out of Stock'}
          </button>
          
          <button
            onClick={handleWishlistToggle}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '0.75rem',
              background: inWishlist ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: inWishlist ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--glass-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              if (!inWishlist) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              if (!inWishlist) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
