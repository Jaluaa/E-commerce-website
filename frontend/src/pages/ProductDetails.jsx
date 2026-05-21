import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', paddingTop: '2rem' }}>
      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', borderRadius: '1rem', objectFit: 'cover' }} />
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '1.5rem' }}>
          ${product.price.toFixed(2)}
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8' }}>
          {product.description}
        </p>
        <div style={{ marginBottom: '2rem' }}>
          <strong>Category:</strong> {product.category}<br/>
          <strong>In Stock:</strong> {product.stockQuantity} items available
        </div>
        <button className="btn btn-primary btn-block" onClick={() => addToCart(product.id, 1)} style={{ padding: '1rem', fontSize: '1.2rem' }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
