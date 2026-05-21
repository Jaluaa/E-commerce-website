import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data.slice(0, 4))) // Featured products
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '6rem 1rem', marginBottom: '4rem', background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '1rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fff' }}>Welcome to NexusShop</h1>
        <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>Discover state-of-the-art products built for the modern lifestyle.</p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>Shop Now</Link>
      </div>

      <div className="container">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Featured Products</h2>
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
