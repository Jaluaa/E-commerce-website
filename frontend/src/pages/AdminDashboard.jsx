import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Route Guard: enforce admin status
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Tab State: 'overview' | 'products' | 'orders' | 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Backend Data States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal States for Add/Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for 'add'
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Hoodies',
    fandom: 'Harry Potter',
    stockQuantity: ''
  });

  const categoriesList = ['Hoodies', 'Keychains', 'Tshirts', 'Mugs', 'BLACKPINK', 'twice', 'itzy', 'red velvet'];
  const fandomsList = ['Harry Potter', 'Friends', 'K-pop', 'K-drama'];

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Stats & Users
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data) {
        setStats(statsRes.data.stats || { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
        setUsers(statsRes.data.users || []);
      }

      // Fetch Products
      const productsRes = await api.get('/products');
      if (productsRes.data) {
        setProducts(productsRes.data);
      }

      // Fetch Orders
      const ordersRes = await api.get('/admin/orders');
      if (ordersRes.data) {
        setOrders(ordersRes.data);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrative data. Make sure backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Handle Success Notifications
  const triggerNotification = (msg) => {
    showToast(msg, 'success');
  };

  // Product CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'Hoodies',
      fandom: 'Harry Potter',
      stockQuantity: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      imageUrl: p.imageUrl || '',
      category: p.category || 'Hoodies',
      fandom: p.fandom || 'Harry Potter',
      stockQuantity: p.stockQuantity || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stockQuantity) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity, 10),
        rating: editingProduct ? editingProduct.rating : 4.5,
        variants: editingProduct ? editingProduct.variants : ["S", "M", "L", "XL"]
      };

      if (editingProduct) {
        // Edit Product
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        triggerNotification(`Product "${res.data.name}" updated successfully!`);
      } else {
        // Add Product
        const res = await api.post('/products', payload);
        triggerNotification(`Product "${res.data.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save product details.', 'error');
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!confirm(`Are you absolutely sure you want to delete product "${name}"?`)) return;

    try {
      await api.delete(`/products/${productId}`);
      triggerNotification(`Product "${name}" deleted successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      triggerNotification(`Order status updated to "${newStatus}"!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update order status.', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-radial from-slate-950 via-slate-950 to-slate-900 text-slate-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-accent bg-clip-text text-transparent tracking-wide">
              ADMIN CONTROL CENTRE ⚙️
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Secure store administration terminal. Manage catalog, orders, and system directories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchAdminData}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-900/80 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              🔄 Refresh Data
            </button>
            {activeTab === 'products' && (
              <button 
                onClick={handleOpenAddModal}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                ＋ Add New Product
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold animate-heart-pop">
            📬 {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold animate-heart-pop">
            ⚠️ {error}
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-4 mb-8">
          {[
            { id: 'overview', label: 'Overview Stats', icon: '📊' },
            { id: 'products', label: 'Manage Products', icon: '🛍️' },
            { id: 'orders', label: 'Monitor Orders', icon: '📦' },
            { id: 'users', label: 'Users Directory', icon: '👥' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/20 scale-105' 
                  : 'bg-slate-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING SHIMMER */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="animate-heart-pop">
            
            {/* TABS 1: OVERVIEW STATS */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, desc: 'Aggregated lifetime product sales', color: 'from-emerald-400 to-teal-400', glow: 'shadow-emerald-500/10' },
                    { label: 'Total Orders', value: stats.totalOrders, desc: 'Successful database checkout logs', color: 'from-blue-400 to-indigo-400', glow: 'shadow-blue-500/10' },
                    { label: 'Products in DB', value: stats.totalProducts, desc: 'Total catalog stock items in MongoDB', color: 'from-amber-400 to-orange-400', glow: 'shadow-amber-500/10' },
                    { label: 'Registered Users', value: stats.totalUsers, desc: 'Verified and unverified customer logons', color: 'from-purple-400 to-pink-400', glow: 'shadow-purple-500/10' }
                  ].map((metric, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl premium-card border border-white/8 shadow-xl ${metric.glow} flex flex-col justify-between h-36`}>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                      <div className="my-2">
                        <span className={`text-3xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                          {metric.value}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{metric.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Dashboard Secondary Blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 p-6 rounded-2xl premium-card border border-white/5">
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-4">Database Inventory Summary</h3>
                    <div className="space-y-4">
                      {products.length === 0 ? (
                        <p className="text-xs text-slate-400">No database products found. Populate the database to view catalog summaries.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-slate-400">
                                <th className="pb-2 font-bold">Product Item</th>
                                <th className="pb-2 font-bold">Fandom</th>
                                <th className="pb-2 font-bold text-right">Price</th>
                                <th className="pb-2 font-bold text-right">DB Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.slice(0, 5).map(p => (
                                <tr key={p._id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-2.5 font-medium text-slate-200">{p.name}</td>
                                  <td className="py-2.5 text-slate-400">{p.fandom || 'Generic'}</td>
                                  <td className="py-2.5 text-right text-brand-primary font-bold">${p.price.toFixed(2)}</td>
                                  <td className="py-2.5 text-right font-semibold">
                                    <span className={p.stockQuantity <= 10 ? 'text-red-400' : 'text-slate-200'}>
                                      {p.stockQuantity} qty
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {products.length > 5 && (
                            <button onClick={() => setActiveTab('products')} className="mt-4 text-[10px] font-bold text-brand-primary hover:underline">
                              View all {products.length} catalog items →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl premium-card border border-white/5">
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-4">Latest Logged-in Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <span className="font-semibold text-slate-300 truncate max-w-[120px]">{u.email}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.role === 'admin' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-800 text-slate-400'}`}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: PRODUCTS MANAGER */}
            {activeTab === 'products' && (
              <div className="rounded-2xl premium-card border border-white/5 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Active Product Inventory</h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {products.length} products total
                  </span>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <span className="text-4xl mb-4">🛍️</span>
                    <p className="text-xs text-slate-400">No database products found. Click "Add New Product" to populate your catalog.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 font-black">Details</th>
                          <th className="pb-3 font-black">Fandom</th>
                          <th className="pb-3 font-black">Category</th>
                          <th className="pb-3 font-black text-right">Price</th>
                          <th className="pb-3 font-black text-right">Stock</th>
                          <th className="pb-3 font-black text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-[10px]">🛍️</div>
                                )}
                                <div>
                                  <p className="font-semibold text-slate-200 text-xs">{p.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-slate-300 font-medium">{p.fandom || 'Generic'}</td>
                            <td className="py-3 text-slate-400 font-medium">{p.category || 'Uncategorized'}</td>
                            <td className="py-3 text-right text-brand-primary font-bold text-xs">${p.price.toFixed(2)}</td>
                            <td className="py-3 text-right font-semibold">
                              <span className={p.stockQuantity <= 10 ? 'text-red-400' : 'text-slate-200'}>
                                {p.stockQuantity} qty
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-brand-primary/20 transition-all cursor-pointer"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p._id, p.name)}
                                  className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TABS 3: ORDERS MONITOR */}
            {activeTab === 'orders' && (
              <div className="rounded-2xl premium-card border border-white/5 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Customer Checkouts</h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {orders.length} orders total
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <span className="text-4xl mb-4">📦</span>
                    <p className="text-xs text-slate-400">No database order records found. Synchronized checkouts will register here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 font-black">Order ID</th>
                          <th className="pb-3 font-black">Date</th>
                          <th className="pb-3 font-black">Delivery Details</th>
                          <th className="pb-3 font-black text-right">Items Count</th>
                          <th className="pb-3 font-black text-right">Total Price</th>
                          <th className="pb-3 font-black text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => {
                          const itemsCount = (o.items || []).reduce((acc, it) => acc + it.quantity, 0);
                          const dateObj = o.createdAt ? new Date(o.createdAt) : new Date();
                          return (
                            <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3.5 font-bold text-slate-400 text-[10px] truncate max-w-[80px]">
                                {o.id}
                              </td>
                              <td className="py-3.5 text-slate-400 font-medium">
                                {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5">
                                <p className="font-semibold text-slate-200 text-xs">{o.shippingAddress?.fullName || 'Registered Member'}</p>
                                <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                  {o.shippingAddress?.address}, {o.shippingAddress?.city}
                                </p>
                              </td>
                              <td className="py-3.5 text-right font-medium text-slate-300">
                                {itemsCount} items
                              </td>
                              <td className="py-3.5 text-right font-bold text-brand-primary text-xs">
                                ${o.total.toFixed(2)}
                              </td>
                              <td className="py-3.5 text-center">
                                <select 
                                  value={o.status || 'pending'}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold outline-hidden transition-all cursor-pointer ${
                                    o.status === 'completed' || o.status === 'delivered'
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : o.status === 'shipped'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        : o.status === 'cancelled'
                                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  }`}
                                >
                                  <option value="pending" className="bg-slate-950 text-slate-200">Pending</option>
                                  <option value="shipped" className="bg-slate-950 text-slate-200">Shipped</option>
                                  <option value="delivered" className="bg-slate-950 text-slate-200">Delivered</option>
                                  <option value="cancelled" className="bg-slate-950 text-slate-200">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TABS 4: USERS DIRECTORY */}
            {activeTab === 'users' && (
              <div className="rounded-2xl premium-card border border-white/5 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">System Users</h3>
                  <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {users.length} accounts total
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-black">User ID</th>
                        <th className="pb-3 font-black">Account Email</th>
                        <th className="pb-3 font-black">Auth Role</th>
                        <th className="pb-3 font-black text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-[10px] text-slate-400 truncate max-w-[120px]">
                            {u.id}
                          </td>
                          <td className="py-3 font-bold text-slate-200">
                            {u.email}
                          </td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              u.role === 'admin' 
                                ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/10' 
                                : 'bg-slate-800 text-slate-400 border border-white/5'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${u.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_verified ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                              {u.is_verified ? 'Verified' : 'Pending OTP'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* MODAL FOR ADD/EDIT PRODUCT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
            <div className="w-full max-w-lg premium-card border border-white/10 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm p-1 hover:bg-white/5 rounded-full"
              >
                ✕
              </button>

              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <span>🛍️</span> {editingProduct ? 'Update Product Details' : 'Add New Fandom Product'}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Product Title/Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                    placeholder="e.g. Hogwarts Castle Metallic Hoodie"
                    className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Provide a stunning description of the product highlights..."
                    className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={productForm.price}
                      onChange={e => setProductForm({...productForm, price: e.target.value})}
                      placeholder="e.g. 49.99"
                      className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Stock Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})}
                      placeholder="e.g. 50"
                      className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                {/* Fandom Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shop Fandom</label>
                    <select
                      value={productForm.fandom}
                      onChange={e => setProductForm({...productForm, fandom: e.target.value})}
                      className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs bg-slate-900 cursor-pointer"
                    >
                      {fandomsList.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag</label>
                    <select
                      value={productForm.category}
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
                      className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs bg-slate-900 cursor-pointer"
                    >
                      {categoriesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Image Asset URL</label>
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                    placeholder="https://images.unsplash.com/... or /images/..."
                    className="premium-input w-full px-4 py-2.5 rounded-xl border text-xs"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    {editingProduct ? 'Save Product Details ✨' : 'Launch New Product ✨'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
