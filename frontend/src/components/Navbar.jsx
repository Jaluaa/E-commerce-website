import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

// Glowing Magical SVG FandomRealm Logo Icon
const LogoIcon = ({ className = "w-7 h-7" }) => (
  <svg className={`${className} filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:rotate-12 transition-transform duration-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#d946ef" />
      </linearGradient>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer magic dash ring */}
    <circle cx="12" cy="12" r="9.5" stroke="url(#logo-grad)" strokeWidth="1.5" strokeDasharray="3 2" filter="url(#logo-glow)" />
    {/* Outer solid thin ring */}
    <circle cx="12" cy="12" r="7.5" stroke="url(#logo-grad)" strokeWidth="0.5" strokeOpacity="0.5" />
    {/* Wizard hat / star crown crest */}
    <path d="M12 4.5L7 13.5H17L12 4.5Z" fill="url(#logo-grad)" fillOpacity="0.15" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Inner magical diamond star */}
    <path d="M12 7.5L13 9.8L15.3 10.8L13 11.8L12 14.1L11 11.8L8.7 10.8L11 9.8L12 7.5Z" fill="url(#logo-grad)" filter="url(#logo-glow)" />
  </svg>
);

function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    setSidebarOpen(false);
    setActiveDropdown(null);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const fandomData = [
    {
      fandom: 'Harry Potter',
      categories: ['Hoodies', 'Keychains', 'Tshirts']
    },
    {
      fandom: 'Friends',
      categories: ['Mugs', 'Hoodies', 'Tshirts']
    },
    {
      fandom: 'K-pop',
      categories: ['BLACKPINK', 'twice', 'itzy', 'red velvet']
    },
    {
      fandom: 'K-drama',
      categories: ['Tshirts']
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Mobile Sidebar/Drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 z-55 flex w-72 flex-col bg-slate-950/95 border-r border-white/5 p-6 overflow-y-auto transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <LogoIcon className="w-6 h-6" />
            <span className="text-xl font-black bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent tracking-wider group-hover:brightness-110 transition-all">
              FANDOMREALM
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white text-lg p-2 rounded-full hover:bg-white/5 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* User Card inside Sidebar */}
        {user && (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center font-bold text-white text-sm">
                {user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-100 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search inside Sidebar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search merchandise..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-200 text-sm outline-hidden focus:border-brand-primary/60 focus:bg-slate-900/80 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Navigation Section */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Navigation</p>
          <div className="space-y-1">
            <Link to="/" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link to="/products" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              All Collection
            </Link>
            <Link to="/cart" className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <span className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Shopping Cart
              </span>
              {cartCount > 0 && <span className="bg-brand-accent px-2 py-0.5 rounded-full text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
            <Link to="/wishlist" className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <span className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                My Wishlist
              </span>
              {wishlistCount > 0 && <span className="bg-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">{wishlistCount}</span>}
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-primary hover:text-white hover:bg-brand-primary/10 transition-all text-sm font-bold">
                <span className="text-sm">⚙️</span>
                Admin Portal
              </Link>
            )}
            {user && (
              <Link to="/orders" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                My Orders
              </Link>
            )}
          </div>
        </div>

        {/* Fandom Categories Section */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Shop Fandoms</p>
          <div className="space-y-3">
            {fandomData.map(f => (
              <div key={f.fandom} className="px-3">
                <span className="text-xs font-bold text-slate-200 block mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent animate-pulse" />
                  {f.fandom}
                </span>
                <div className="pl-5 space-y-1 border-l border-white/5">
                  <Link
                    to={`/products?fandom=${encodeURIComponent(f.fandom)}`}
                    className="block py-1 text-xs text-slate-400 hover:text-brand-primary"
                  >
                    View All {f.fandom}
                  </Link>
                  {f.categories.map(c => (
                    <Link
                      key={c}
                      to={`/products?fandom=${encodeURIComponent(f.fandom)}&category=${encodeURIComponent(c)}`}
                      className="block py-1 text-xs text-slate-400 hover:text-brand-primary"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout/Auth at bottom */}
        <div className="mt-auto pt-6 border-t border-white/5">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 text-sm transition-all"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all shimmer-btn">
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md shadow-2xl shadow-black/30 border-b border-white/5 py-3' : 'bg-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between">

          {/* Hamburger + Brand */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 lg:mr-8 xl:mr-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-300 hover:text-white p-1.5 sm:p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group select-none">
              <LogoIcon className="w-7 h-7 md:w-8 h-8" />
              <span className="text-[15px] min-[380px]:text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent tracking-wider group-hover:brightness-110 transition-all">
                FANDOMREALM
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Category Dropdowns */}
          <div ref={dropdownRef} className="hidden xl:flex items-center xl:gap-6 ml-4">
            {fandomData.map(f => (
              <div
                key={f.fandom}
                className="relative group/nav"
                onMouseEnter={() => setActiveDropdown(f.fandom)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="relative flex items-center gap-1.5 text-slate-300 hover:text-white py-2 text-sm font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap">
                  {f.fandom}
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${activeDropdown === f.fandom ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                  {/* Premium Underline Hover Animation */}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-brand-primary to-brand-accent transition-transform duration-300 origin-center ${activeDropdown === f.fandom ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'}`} />
                </button>

                {/* Dropdown Card */}
                {activeDropdown === f.fandom && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-3 z-50 animate-heart-pop">
                    <div className="rounded-2xl premium-card p-2 shadow-2xl">
                      <Link
                        to={`/products?fandom=${encodeURIComponent(f.fandom)}`}
                        className="block px-4 py-2.5 text-xs font-bold text-brand-primary hover:bg-white/5 rounded-xl transition-all"
                      >
                        View All {f.fandom}
                      </Link>
                      <div className="h-px bg-white/5 my-1" />
                      {f.categories.map(c => (
                        <Link
                          key={c}
                          to={`/products?fandom=${encodeURIComponent(f.fandom)}&category=${encodeURIComponent(c)}`}
                          className="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/products" className="text-slate-300 hover:text-white text-sm font-bold tracking-wide transition-colors">
              Collection
            </Link>
          </div>

          {/* Desktop Search + Action Icons */}
          <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2">
            {/* Quick search input */}
            <form onSubmit={handleSearch} className="hidden md:block lg:ml-2 xl:ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search merch..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-32 xl:w-44 pl-9 pr-4 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/5 focus:border-brand-primary/60 focus:w-40 xl:focus:w-52 text-slate-200 text-xs transition-all outline-hidden"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Grouped Wishlist & Cart to reduce space between them */}
            <div className="flex items-center gap-0">
              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-black border border-slate-950 scale-95 shadow-md shadow-red-500/20">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 text-slate-300 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-primary text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-black border border-slate-950 scale-95 shadow-md shadow-brand-primary/20">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Auth/Profile */}
            <div ref={profileRef} className="relative flex-shrink-0">
              {user ? (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center font-bold text-white text-sm shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                >
                  {user.email[0].toUpperCase()}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent shadow-lg shadow-brand-primary/10 hover:brightness-115 active:scale-95 transition-all whitespace-nowrap shimmer-btn cursor-pointer block"
                >
                  Login
                </Link>
              )}

              {/* Profile Dropdown Panel */}
              {profileOpen && user && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl premium-card p-2 shadow-2xl animate-heart-pop z-50">
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-slate-400">Logged in as</p>
                    <p className="text-xs font-bold text-slate-200 truncate">{user.email}</p>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block w-full text-left px-3 py-2 text-xs text-brand-primary hover:text-white hover:bg-brand-primary/10 rounded-xl transition-all font-bold flex items-center gap-1.5"
                      onClick={() => setProfileOpen(false)}
                    >
                      ⚙️ Admin Portal
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="block w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </nav>
      {/* Spacer to prevent navbar overlapping content */}
      <div className="h-20" />
    </>
  );
}

export default Navbar;
