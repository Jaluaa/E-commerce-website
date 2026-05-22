import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function Wishlist() {
  const { wishlistItems } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '2rem' }}>❤️</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🤍</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Wishlist is empty</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            Tap the heart icon on any product to save it here for later. Find something you love today!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '0.75rem' }}>
            Discover Products
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            You have {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your wishlist.
          </p>
          <div className="product-grid">
            {wishlistItems.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
