import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [productsCache, setProductsCache] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        // Sort orders by date descending
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);

        // Fetch details of all unique product IDs in the orders to populate images and names
        const uniqueProductIDs = new Set();
        sorted.forEach(order => {
          order.items?.forEach(item => {
            uniqueProductIDs.add(item.productId);
          });
        });

        const cache = {};
        for (const pid of uniqueProductIDs) {
          try {
            const prodRes = await api.get(`/products/${pid}`);
            cache[pid] = prodRes.data;
          } catch (e) {
            console.error(e);
          }
        }
        setProductsCache(cache);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  if (!user) return <div className="container" style={{ padding: '4rem 1rem' }}>Please <Link to="/login" style={{ color: 'var(--primary-color)' }}>login</Link> to view your orders.</div>;
  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '2rem' }}>📦</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>My Orders</h1>
      </div>

      {orders.length === 0 ? (
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
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🛍️</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>No orders placed yet</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            Browse our catalog, add items to your cart, and place an order to see it appear here!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '0.75rem' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const date = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="glass"
                style={{
                  borderRadius: '1.25rem',
                  border: '1px solid var(--glass-border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpandOrder(order.id)}
                  style={{
                    padding: '1.5rem 2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>ORDER ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>DATE PLACED</span>
                    <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{date}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL AMOUNT</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Status Badge */}
                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '2rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {order.status || 'Completed'}
                    </span>

                    <span style={{ fontSize: '1.25rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#64748b' }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Accordion Detail Body */}
                {isExpanded && (
                  <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                    {/* Items Purchased List */}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Items Ordered</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {order.items?.map((item, idx) => {
                          const product = productsCache[item.productId] || {};
                          return (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <img src={product.imageUrl} alt={product.name} style={{ width: '44px', height: '44px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '0.875rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                  {product.name || 'Product Details'}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                              </div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping Address & Details Receipt */}
                    <div style={{ background: 'rgba(15,23,42,0.3)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Shipping & Details</h3>
                      
                      {order.shippingAddress ? (
                        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#cbd5e1' }}>
                          <div><span style={{ color: '#64748b' }}>Recipient:</span> <strong style={{ color: '#fff' }}>{order.shippingAddress.fullName}</strong></div>
                          <div><span style={{ color: '#64748b' }}>Address:</span> <span style={{ color: '#fff' }}>{order.shippingAddress.address}</span></div>
                          <div><span style={{ color: '#64748b' }}>City/ZIP:</span> <span style={{ color: '#fff' }}>{order.shippingAddress.city}, {order.shippingAddress.zip}</span></div>
                          <div><span style={{ color: '#64748b' }}>Country:</span> <span style={{ color: '#fff' }}>{order.shippingAddress.country}</span></div>
                          <div><span style={{ color: '#64748b' }}>Phone:</span> <span style={{ color: '#fff' }}>{order.shippingAddress.phone}</span></div>
                          <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>Payment Method:</span> <strong style={{ color: 'var(--primary-color)' }}>{order.paymentMethod || 'Credit Card'}</strong>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Standard shipping details (Checkout completed).</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
