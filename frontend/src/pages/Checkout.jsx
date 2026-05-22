import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function Checkout() {
  const { cartItems, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const [productsCache, setProductsCache] = useState({});
  const navigate = useNavigate();

  // Multi-step state: 'shipping' | 'payment' | 'submitting'
  const [checkoutStep, setCheckoutStep] = useState('shipping');

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    zip: '',
    country: 'USA',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // 'credit_card' | 'paypal' | 'cod'

  // Credit Card Interactive Widget states
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Client-side validations
  const [errors, setErrors] = useState({});

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

  if (!user) return <div className="container" style={{ padding: '4rem 1rem' }}>Please <Link to="/login" style={{ color: 'var(--primary-color)' }}>login</Link> to view checkout.</div>;
  if (cartItems.length === 0 && checkoutStep !== 'submitting') {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>🛒</span>
        <h2>Your Cart is empty</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>Add some products to your cart before checking out!</p>
        <Link to="/products" className="btn btn-primary">Go to Products</Link>
      </div>
    );
  }

  // Calculate receipt totals
  const subtotal = cartItems.reduce((acc, item) => {
    const product = productsCache[item.productId] || { price: 0 };
    return acc + (product.price * item.quantity);
  }, 0);

  const shippingCost = subtotal > 200 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const orderTotal = subtotal + shippingCost + tax;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!shippingAddress.address.trim()) newErrors.address = 'Street Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.zip.trim()) newErrors.zip = 'ZIP/Postal code is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      // Formatter for card number
      const formatted = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
      setCardDetails(prev => ({ ...prev, number: formatted }));
    } else if (name === 'expiry') {
      const formatted = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().substring(0, 5);
      if (formatted.endsWith('/')) {
        setCardDetails(prev => ({ ...prev, expiry: formatted.slice(0, -1) }));
      } else {
        setCardDetails(prev => ({ ...prev, expiry: formatted }));
      }
    } else if (name === 'cvv') {
      setCardDetails(prev => ({ ...prev, cvv: value.replace(/\D/g, '').substring(0, 3) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validatePayment = () => {
    if (paymentMethod !== 'credit_card') return true;
    const newErrors = {};
    if (cardDetails.number.length < 19) newErrors.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';
    if (cardDetails.expiry.length < 5) newErrors.cardExpiry = 'Enter expiry date MM/YY';
    if (cardDetails.cvv.length < 3) newErrors.cardCvv = 'Enter 3-digit CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setCheckoutStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return;

    setCheckoutStep('submitting');
    try {
      const displayMethod = paymentMethod === 'credit_card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery';
      await api.post('/orders/checkout', {
        shippingAddress,
        paymentMethod: displayMethod
      });
      alert("Order placed successfully! Thank you for shopping with us.");
      clearCart();
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.error || "Checkout failed");
      setCheckoutStep('payment');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '90vh' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🔒</span> Secure Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Column: Form Steps */}
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)' }}>
          {/* Step Indicator Bullets */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: checkoutStep === 'shipping' ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: checkoutStep === 'payment' ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: checkoutStep === 'payment' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Payment</span>
            </div>
          </div>

          {checkoutStep === 'shipping' && (
            <form onSubmit={handleNextToPayment}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shipping Information</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleShippingChange}
                  className="form-input"
                  placeholder="John Doe"
                />
                {errors.fullName && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.fullName}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  className="form-input"
                  placeholder="123 Main St, Apt 4B"
                />
                {errors.address && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.address}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="form-input"
                    placeholder="New York"
                  />
                  {errors.city && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.city}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={shippingAddress.zip}
                    onChange={handleShippingChange}
                    className="form-input"
                    placeholder="10001"
                  />
                  {errors.zip && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.zip}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="form-input"
                    placeholder="(555) 000-0000"
                  />
                  {errors.phone && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.phone}</div>}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem', padding: '0.85rem', borderRadius: '0.75rem' }}>
                Continue to Payment →
              </button>
            </form>
          )}

          {checkoutStep === 'payment' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Payment Method</h2>
              
              {/* Payment Select Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {[
                  { id: 'credit_card', label: '💳 Card' },
                  { id: 'paypal', label: '🅿️ PayPal' },
                  { id: 'cod', label: '💵 COD' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => { setPaymentMethod(method.id); setErrors({}); }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: paymentMethod === method.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontWeight: 600,
                      border: paymentMethod === method.id ? '1px solid var(--primary-hover)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'credit_card' && (
                <div>
                  {/* Interactive Glowing Mock Credit Card Widget */}
                  <div style={{
                    width: '100%',
                    height: '190px',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #1d4ed8, #8b5cf6, #ec4899)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
                    padding: '1.5rem',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {/* Glass Overlay Glow */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em' }}>NEXUS CARD</span>
                      <span style={{ fontSize: '1.5rem' }}>🌐</span>
                    </div>

                    <div style={{ zIndex: 1 }}>
                      {/* Sim Chip Icon */}
                      <div style={{ width: '36px', height: '26px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '0.25rem', marginBottom: '0.75rem', opacity: 0.85 }} />
                      <div style={{ fontSize: '1.35rem', fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 700 }}>
                        {cardDetails.number || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>Cardholder</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                          {cardDetails.name.toUpperCase() || 'YOUR NAME'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>Expires</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cardDetails.expiry || 'MM/YY'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>CVV</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cardDetails.cvv || '•••'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form fields for Card */}
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      className="form-input"
                      placeholder="4000 1234 5678 9010"
                    />
                    {errors.cardNumber && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.cardNumber}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cardholder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      className="form-input"
                      placeholder="JOHN DOE"
                    />
                    {errors.cardName && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.cardName}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Expiration Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        className="form-input"
                        placeholder="MM/YY"
                      />
                      {errors.cardExpiry && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.cardExpiry}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        className="form-input"
                        placeholder="123"
                      />
                      {errors.cardCvv && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.cardCvv}</div>}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'rgba(59,130,246,0.08)', borderRadius: '1rem', border: '1px dashed rgba(59,130,246,0.3)', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>🅿️</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0' }}>PayPal Express Checkout</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>You will be redirected to PayPal to complete your payment securely after placing the order.</p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: '1rem', border: '1px dashed rgba(16,185,129,0.3)', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>💵</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0' }}>Cash on Delivery</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Pay with cash upon physical delivery. No prepayment required.</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setCheckoutStep('shipping')}
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#f8fafc', padding: '0.85rem 1.5rem', borderRadius: '0.75rem' }}
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem' }}
                >
                  Place Order & Pay 🚀
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'submitting' && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{
                border: '4px solid rgba(255,255,255,0.1)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                borderLeftColor: 'var(--primary-color)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Processing Your Order...</h3>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Please do not refresh or close this window.</p>
              
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Receipt */}
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {cartItems.map((item, idx) => {
              const product = productsCache[item.productId] || {};
              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{product.name || 'Loading...'}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    ${((product.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping Cost</span>
              <span style={{ color: shippingCost === 0 ? '#10b981' : '#fff', fontWeight: 600 }}>
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>${tax.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: '#fff', fontWeight: 800, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-color)' }}>${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
