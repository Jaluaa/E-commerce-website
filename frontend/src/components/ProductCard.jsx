import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  // MongoDB returns _id, not id
  const id = product._id;
  const inWishlist = isInWishlist(id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login first');
      return;
    }
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <div className="product-card glass" style={{ position: 'relative' }}>
      {/* Wishlist Heart Toggle */}
      <button
        onClick={handleWishlistToggle}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s',
          fontSize: '1.1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.12)';
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
        }}
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {inWishlist ? '❤️' : '🤍'}
      </button>

      <Link to={`/products/${id}`}>
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-info">
        <div style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
          {product.category}
        </div>
        <Link to={`/products/${id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p style={{ marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.9rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.description.substring(0, 60)}...
        </p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => addToCart(id, 1)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;