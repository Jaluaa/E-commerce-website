import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import productsData from '../data/products';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const loadAllOrders = async () => {
      setLoading(true);
      
      // Load local orders from localStorage based on guest or user email
      const emailKey = user ? user.email : 'guest';
      const storedOrdersKey = `orders_${emailKey}`;
      let localOrdersList = [];
      
      try {
        const stored = localStorage.getItem(storedOrdersKey);
        if (stored) {
          localOrdersList = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse local orders:", e);
      }

      // If user is logged in, attempt to fetch orders from the Go backend database as well
      let backendOrdersList = [];
      if (user) {
        try {
          const res = await api.get('/orders');
          if (res.data && Array.isArray(res.data)) {
            // Normalize backend orders to match local order schema
            backendOrdersList = res.data.map(order => ({
              id: order.id || order._id || `ord_back_${Math.random().toString(36).substring(2, 7)}`,
              createdAt: order.createdAt || new Date().toISOString(),
              items: (order.items || []).map(item => ({
                productId: item.productId || item.product_id,
                quantity: item.quantity,
                price: item.price || 0,
                variant: item.variant || ''
              })),
              total: order.total || 0,
              subtotal: order.subtotal || order.total || 0,
              discountAmount: order.discountAmount || 0,
              shippingCost: order.shippingCost || 0,
              tax: order.tax || 0,
              shippingAddress: order.shippingAddress || {
                fullName: 'Registered Member',
                email: user.email,
                address: 'Checkout Completed',
                city: '',
                zip: '',
                country: '',
                phone: ''
              },
              paymentMethod: order.paymentMethod || 'Credit Card',
              status: order.status || 'completed'
            }));
          }
        } catch (error) {
          console.error("Backend fetch orders failed, falling back purely to localStorage history:", error);
        }
      }

      // Combine local and backend orders, deduplicating by ID
      const allOrdersMap = new Map();
      
      // Add backend orders first
      backendOrdersList.forEach(order => {
        allOrdersMap.set(order.id, order);
      });
      
      // Add local orders (overwriting backend duplicates, as local has richer layout fields like discounts/taxes)
      localOrdersList.forEach(order => {
        allOrdersMap.set(order.id, order);
      });

      // Convert map back to array and sort by createdAt date descending
      const combinedSorted = Array.from(allOrdersMap.values()).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(combinedSorted);
      setLoading(false);
    };

    loadAllOrders();
  }, [user]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  // Find product helper with robust fallback
  const getProductDetails = (productId) => {
    const found = productsData.find(p => p.id === productId);
    if (found) return found;
    
    // Fallback: in case of MongoDB Hex ObjectIDs, check if any product ID matches as a substring, or return fallback
    const substringMatch = productsData.find(p => productId && (productId.includes(p.id) || p.id.includes(productId)));
    if (substringMatch) return substringMatch;

    return {
      title: 'Premium Fandom Merchandise',
      fandom: 'Fandom Special',
      images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'],
      price: 0
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="border-4 border-white/10 w-12 h-12 rounded-full border-l-brand-primary animate-spin" />
        <h3 className="text-base font-extrabold text-white">Loading Order History...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      
      {/* Back to Home Button */}
      <div className="pt-4 mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl filter drop-shadow-md">📦</span>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">My Orders</h1>
          <p className="text-xs text-slate-400 mt-1">
            {user 
              ? `Review details and delivery statuses of your past purchases associated with ${user.email}` 
              : 'Review your guest orders and delivery details stored in this browser session'}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 glass rounded-3xl border border-white/5 max-w-xl mx-auto space-y-6">
          <span className="text-6xl filter drop-shadow-md">🛍️</span>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-white">No Order History Found</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't completed any magic checkouts yet. Let's explore our fandom catalog and find your favorites!
            </p>
          </div>
          <Link 
            to="/products" 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all"
          >
            Explore Fandom Store
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const date = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className={`glass rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-brand-primary/30 ring-2 ring-brand-primary/5 bg-slate-900/40' : 'border-white/5 hover:border-white/10 hover:bg-slate-900/10'}`}
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleExpandOrder(order.id)}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 gap-4 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-white/3 border-b border-white/5' : 'bg-transparent'}`}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 flex-1 items-center">
                    
                    {/* Order Reference */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Order Reference</span>
                      <span className="font-mono text-xs font-black text-white uppercase truncate block max-w-[150px]">
                        {order.id.replace('ord_', '#')}
                      </span>
                    </div>

                    {/* Date Placed */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Date Placed</span>
                      <span className="text-xs font-bold text-slate-200 block truncate">{date}</span>
                    </div>

                    {/* Product Images Preview */}
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Products</span>
                      <div className="flex -space-x-2.5 overflow-hidden items-center mt-1">
                        {order.items?.slice(0, 3).map((item, idx) => {
                          const product = getProductDetails(item.productId);
                          const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';
                          return (
                            <img
                              key={idx}
                              src={displayImage}
                              alt={product.title}
                              className="w-8 h-8 rounded-lg object-cover border-2 border-slate-900 shadow-md flex-shrink-0"
                              title={`${product.title} (x${item.quantity})`}
                            />
                          );
                        })}
                        {order.items?.length > 3 && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border-2 border-slate-900 text-[10px] font-black text-slate-300 z-10 shadow-md">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Total Paid */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Total Paid</span>
                      <span className="text-xs font-black text-brand-accent block">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Delivery Status</span>
                      <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${order.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {order.status || 'Completed'}
                      </span>
                    </div>

                  </div>

                  {/* Expand Icon Arrow */}
                  <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                    <span className="text-[10px] font-bold text-brand-primary md:hidden">Click to view details</span>
                    <span className={`text-[10px] text-slate-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : 'rotate-0'}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Accordion Detail Body */}
                {isExpanded && (
                  <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                    
                    {/* Items Purchased List */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-white/5">
                        Products Ordered
                      </h3>
                      
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => {
                          const product = getProductDetails(item.productId);
                          const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';
                          return (
                            <div key={idx} className="flex gap-4 items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-white/5 hover:border-white/10 hover:bg-slate-900/30 transition-all duration-200">
                              <Link 
                                to={`/products/${item.productId}`}
                                className="flex items-center gap-3 min-w-0 group cursor-pointer"
                              >
                                <img 
                                  src={displayImage} 
                                  alt={product.title} 
                                  className="w-10 h-10 rounded-lg object-cover border border-white/5 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-bold text-brand-primary uppercase tracking-wider block">
                                    {product.fandom}
                                  </span>
                                  <h4 className="text-xs font-black text-white group-hover:text-brand-primary truncate max-w-[200px] sm:max-w-xs md:max-w-md transition-colors duration-200">
                                    {product.title}
                                  </h4>
                                  {item.variant && (
                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      Style: <span className="text-slate-200 font-semibold">{item.variant}</span>
                                    </span>
                                  )}
                                </div>
                              </Link>

                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-bold text-slate-200 block">
                                  ₹{item.price.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-slate-500 block">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping Address & Receipt Breakdown */}
                    <div className="space-y-4">
                      
                      {/* Shipping Info Block */}
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2 text-xs text-slate-400">
                        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest pb-1 border-b border-white/5 mb-2">
                          Delivery Details
                        </h4>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Recipient</span>
                          <span className="text-white font-extrabold">{order.shippingAddress?.fullName}</span>
                        </div>
                        {order.shippingAddress?.email && (
                          <div className="pt-1">
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Email Address</span>
                            <span className="text-slate-300 font-semibold">{order.shippingAddress?.email}</span>
                          </div>
                        )}
                        <div className="pt-1">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Destination Address</span>
                          <span className="text-slate-300">
                            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.zip}, {order.shippingAddress?.country || 'USA'}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Contact Phone</span>
                          <span className="text-slate-300 font-semibold">{order.shippingAddress?.phone}</span>
                        </div>
                        <div className="pt-1.5 border-t border-white/5 mt-2 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase font-bold">Payment Method</span>
                          <strong className="text-brand-primary uppercase font-extrabold">{order.paymentMethod || 'Credit Card'}</strong>
                        </div>
                      </div>

                      {/* Pricing Receipts Breakdown (Only display if stored locally, or calculate from total) */}
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5 text-[10px] text-slate-400">
                        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest pb-1 border-b border-white/5 mb-2">
                          Receipt Summary
                        </h4>
                        
                        {order.subtotal !== undefined ? (
                          <>
                            <div className="flex justify-between">
                              <span>Items Subtotal</span>
                              <span className="font-bold text-slate-200">₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-emerald-400 font-semibold">
                                <span>Promo Discount</span>
                                <span>-₹{order.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping Cost</span>
                              <span className="font-bold text-slate-200">
                                {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estimated Tax (8%)</span>
                              <span className="font-bold text-slate-200">₹{order.tax.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span>Receipt Subtotal</span>
                            <span className="font-bold text-slate-200">₹{(order.total / 1.08).toFixed(2)}</span>
                          </div>
                        )}

                        <div className="h-px bg-white/5 !my-2" />
                        
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-slate-200">Final Order Paid:</span>
                          <span className="text-brand-accent">₹{order.total.toFixed(2)}</span>
                        </div>
                      </div>

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
