import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const { cartItems, removeFromCart, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const [productsCache, setProductsCache] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      const cache = {};
      for (const item of cartItems) {
        if (!productsCache[item.productId]) {
          try {
            const res = await api.get(`/products/${item.productId}`);
            cache[item.productId] = res.data;
          } catch (e) {
             console.error(e);
          }
        }
      }
      if (Object.keys(cache).length > 0) {
        setProductsCache(prev => ({ ...prev, ...cache }));
      }
    };
    if (cartItems.length > 0) fetchProductDetails();
  }, [cartItems]);

  const handleCheckout = async () => {
    try {
      await api.post('/orders/checkout');
      alert("Order placed successfully!");
      clearCart();
      navigate('/orders'); // if an order page exists, else home
    } catch (error) {
      alert(error.response?.data?.error || "Checkout failed");
    }
  };

  if (!user) return <div className="container">Please <Link to="/login">login</Link> to view cart.</div>;

  const total = cartItems.reduce((acc, item) => {
    const product = productsCache[item.productId] || { price: 0 };
    return acc + (product.price * item.quantity);
  }, 0);

  return (
    <div className="container cart-container">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p style={{ marginTop: '2rem' }}>Cart is empty. <Link to="/products" style={{ color: 'var(--primary-color)' }}>Shop now</Link></p>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {cartItems.map((item, idx) => {
            const product = productsCache[item.productId] || {};
            return (
              <div key={idx} className="glass cart-item">
                <div className="cart-item-details">
                  <img src={product.imageUrl} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>{product.name || 'Loading...'}</h3>
                    <p style={{ color: '#cbd5e1' }}>Qty: {item.quantity}</p>
                    <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>${(product.price * item.quantity).toFixed(2) || 0.00}</p>
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => removeFromCart(item.productId)}>Remove</button>
              </div>
            );
          })}
          <div className="cart-total">
            Total: ${total.toFixed(2)}
          </div>
          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleCheckout} style={{ padding: '0.75rem 2rem', fontSize: '1.2rem' }}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
