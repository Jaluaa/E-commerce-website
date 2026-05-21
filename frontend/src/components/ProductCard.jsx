import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  // MongoDB returns _id, not id
  const id = product._id;

  return (
    <div className="product-card glass">
      <Link to={`/products/${id}`}>
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-info">
        <div style={{ color: 'gray', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {product.category}
        </div>
        <Link to={`/products/${id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p style={{ marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
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