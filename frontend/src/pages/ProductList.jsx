import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function ProductList() {
  const [products, setProducts] = useState([]);

    useEffect(() => {
  api.get('/products')
    .then(res => {
      console.log('✅ Data received:', res.data);  // Add this
      setProducts(res.data);
    })
    .catch(err => {
      console.error('❌ Error:', err.response?.status, err.response?.data);  // Add this
    });
}, []);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Our Collection</h1>
      <div className="product-grid">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
