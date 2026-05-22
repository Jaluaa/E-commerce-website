import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productsData from '../data/products';

// 1. Harry Potter: Glowing Wizard Hat & Magical Stars Icon
const HarryPotterIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="hp-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Sorting Hat */}
    <path 
      d="M12 3C11 5.5 8.5 7.5 9 10C9.3 11.5 10.5 12 11 13C10 13.5 8 13.5 7 14C6 14.5 5 15.5 5.5 17C6 18.5 9 18 12 18C15 18 18 18.5 18.5 17C19 15.5 18 14.5 17 14C16 13.5 14 13.5 13 13C13.5 12 14.7 11.5 15 10C15.5 7.5 13 5.5 12 3Z" 
      fill="url(#hp-grad)" 
      fillOpacity="0.2" 
      stroke="url(#hp-grad)" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
      filter="url(#hp-glow)"
    />
    {/* Hat brim details */}
    <path d="M4 17.5C8 16.5 16 16.5 20 17.5" stroke="url(#hp-grad)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 13.5C10.5 14.2 13.5 14.2 15 13.5" stroke="url(#hp-grad)" strokeWidth="1" strokeLinecap="round" />
    {/* Wizard Hat crease patches */}
    <path d="M11 9.5L13 10.5" stroke="url(#hp-grad)" strokeWidth="1" strokeLinecap="round" />
    <path d="M10 7.5L12 8" stroke="url(#hp-grad)" strokeWidth="1" strokeLinecap="round" />
    {/* Magic sparkles */}
    <path d="M5 6L5.5 7.5L7 8L5.5 8.5L5 10L4.5 8.5L3 8L4.5 7.5L5 6Z" fill="#fbbf24" filter="url(#hp-glow)" />
    <path d="M19 8L19.3 9L20.3 9.3L19.3 9.6L19 10.6L18.7 9.6L17.7 9.3L18.7 9L19 8Z" fill="#fbbf24" />
    <path d="M12 1.5L12.3 2.3L13.1 2.5L12.3 2.7L12 3.5L11.7 2.7L10.9 2.5L11.7 2.3L12 1.5Z" fill="#fbbf24" filter="url(#hp-glow)" />
  </svg>
);

// 2. Friends: Steaming Central Perk Coffee Mug Icon
const FriendsIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="fr-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Steaming Vapor waves */}
    <path d="M8 3.5C8.5 4.5 7.5 5.5 8 6.5" stroke="url(#fr-grad)" strokeWidth="1.2" strokeLinecap="round" filter="url(#fr-glow)" />
    <path d="M12 2.5C12.5 3.8 11.5 4.8 12 6.1" stroke="url(#fr-grad)" strokeWidth="1.2" strokeLinecap="round" filter="url(#fr-glow)" />
    <path d="M16 3.5C16.5 4.5 15.5 5.5 16 6.5" stroke="url(#fr-grad)" strokeWidth="1.2" strokeLinecap="round" filter="url(#fr-glow)" />
    {/* Mug Body */}
    <path 
      d="M5 8H17C17 14 15.5 18 11 18C6.5 18 5 14 5 8Z" 
      fill="url(#fr-grad)" 
      fillOpacity="0.2" 
      stroke="url(#fr-grad)" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
      filter="url(#fr-glow)"
    />
    {/* Mug Handle */}
    <path 
      d="M17 10C19.5 10 20.5 11.5 20.5 13C20.5 14.5 19.5 16 17 16" 
      stroke="url(#fr-grad)" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    {/* Coffee Line inside */}
    <path d="M6 10.5C9 11 13 11 16 10.5" stroke="url(#fr-grad)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
    {/* Cute Heart Steam Accent */}
    <path d="M12 5C12 5 11.5 4 12 3.5C12.5 3 13 4 12 5Z" fill="#34d399" />
  </svg>
);

// 3. K-pop: Concert Lightstick & Sparkling Rays
const KpopIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <filter id="kp-glow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Starburst Glow Rays */}
    <line x1="12" y1="2" x2="12" y2="4" stroke="url(#kp-grad)" strokeWidth="1.5" strokeLinecap="round" filter="url(#kp-glow)" />
    <line x1="5.5" y1="5.5" x2="7" y2="7" stroke="url(#kp-grad)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2" y1="12" x2="4" y2="12" stroke="url(#kp-grad)" strokeWidth="1.5" strokeLinecap="round" filter="url(#kp-glow)" />
    <line x1="17" y1="7" x2="18.5" y2="5.5" stroke="url(#kp-grad)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Lightstick Glowing Crown Globe */}
    <circle 
      cx="12" 
      cy="9" 
      r="4.5" 
      fill="url(#kp-grad)" 
      fillOpacity="0.2" 
      stroke="url(#kp-grad)" 
      strokeWidth="1.5" 
      filter="url(#kp-glow)" 
    />
    {/* Heart symbol inside Globe */}
    <path 
      d="M12 10.3L11.2 9.4C10.2 8.3 10.2 6.8 11.2 5.9C12.1 5 13.5 5 14.4 5.9C15.4 6.8 15.4 8.3 14.4 9.4L12 10.3Z" 
      fill="url(#kp-grad)" 
      fillOpacity="0.4"
      transform="rotate(-45 12 9)"
    />
    {/* Lightstick Handle and Collar */}
    <rect x="11" y="14" width="2" height="7" rx="1" fill="url(#kp-grad)" filter="url(#kp-glow)" />
    <path d="M9.5 13.5H14.5" stroke="url(#kp-grad)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sparkling Rays */}
    <circle cx="19" cy="11" r="1" fill="#f472b6" filter="url(#kp-glow)" />
    <circle cx="5" cy="16" r="0.75" fill="#c084fc" />
  </svg>
);

// 4. K-drama: Director's Clapperboard with Light Streaks
const KdramaIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kd-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <filter id="kd-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Clapperboard Body */}
    <path 
      d="M4 11H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V11Z" 
      fill="url(#kd-grad)" 
      fillOpacity="0.2" 
      stroke="url(#kd-grad)" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
      filter="url(#kd-glow)"
    />
    {/* Clapperboard Open Top Lid (Tilted) */}
    <path 
      d="M3.5 9.5L18.5 4.5L19.5 7.5L4.5 12.5L3.5 9.5Z" 
      fill="url(#kd-grad)" 
      fillOpacity="0.3" 
      stroke="url(#kd-grad)" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
    {/* Clapper Stripes on Body */}
    <path d="M7 11L9 14M11 11L13 14M15 11L17 14" stroke="url(#kd-grad)" strokeWidth="1.2" strokeLinecap="round" />
    {/* Stripes on Top Lid */}
    <path d="M6.5 8.5L8.5 7.8M10.5 7.2L12.5 6.5M14.5 5.8L16.5 5.2" stroke="url(#kd-grad)" strokeWidth="1.2" strokeLinecap="round" />
    {/* Movie Spark Star */}
    <path d="M12 14.5L12.5 15.5L13.5 16L12.5 16.5L12 17.5L11.5 16.5L10.5 16L11.5 15.5L12 14.5Z" fill="#22d3ee" filter="url(#kd-glow)" />
    {/* Light Streaks */}
    <path d="M19 13.5L20.5 13M18.5 16L20 16.5" stroke="url(#kd-grad)" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const FANDOMS = [
  { 
    name: 'Harry Potter', 
    icon: HarryPotterIcon, 
    desc: 'Wands, Alumni Hoodies, and Collectibles',
    gradient: 'from-amber-600/20 to-yellow-950/40 border-amber-500/30 hover:border-amber-500/50',
    color: '#eab308',
    bgImage: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-amber-500/10'
  },
  { 
    name: 'Friends', 
    icon: FriendsIcon, 
    desc: 'Central Perk Mugs, Lobsters, and Decor',
    gradient: 'from-emerald-600/20 to-teal-950/40 border-emerald-500/30 hover:border-emerald-500/50',
    color: '#10b981',
    bgImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-emerald-500/10'
  },
  { 
    name: 'K-pop', 
    icon: KpopIcon, 
    desc: 'Official Lightsticks, Albums, and Hoodies',
    gradient: 'from-fuchsia-600/20 to-purple-950/40 border-fuchsia-500/30 hover:border-fuchsia-500/50',
    color: '#d946ef',
    bgImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-fuchsia-500/10'
  },
  { 
    name: 'K-drama', 
    icon: KdramaIcon, 
    desc: 'Destiny Necklaces, Posters, and Minimalism',
    gradient: 'from-cyan-600/20 to-blue-950/40 border-cyan-500/30 hover:border-cyan-500/50',
    color: '#06b6d4',
    bgImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-cyan-500/10'
  },
];

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Get first 4 products as featured
    setFeaturedProducts(productsData.slice(0, 4));
  }, []);

  // Slide loop for hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const slides = [
    {
      title: "Unlock the Magic of Wizardry",
      subtitle: "Harry Potter",
      desc: "Cast your spell with our hand-painted resin Elder Wand replicas and alumni heavyweight hoodies.",
      image: "https://images.unsplash.com/photo-1598153346810-860daa814c4b?q=80&w=1200&auto=format&fit=crop",
      link: "/products?fandom=Harry%20Potter"
    },
    {
      title: "Bring K-pop to Your Area",
      subtitle: "BLACKPINK, twice, itzy & red velvet",
      desc: "Get official premium member photocards, Born Pink street hoodies, and classic comeback concert merchandise.",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
      link: "/products?fandom=K-pop"
    },
    {
      title: "Could this BE any more perfect?",
      subtitle: "Friends Sitcom Decor",
      desc: "Oversized coffee house mugs, yellow peephole door frames, and retro lobster graphic tees.",
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1200&auto=format&fit=crop",
      link: "/products?fandom=Friends"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 pb-20 animate-fade-in-up">
      
      {/* Sliding Hero Carousel Banner */}
      <div className="relative rounded-3xl overflow-hidden glass h-[460px] md:h-[500px] animate-fade-in-up">
        {/* Background Slide Image */}
        <div className="absolute inset-0 bg-slate-950/60 z-1" />
        <img 
          src={slides[currentSlide].image} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-45 transition-all duration-1000 ease-in-out scale-105"
        />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 md:px-16 max-w-3xl mx-auto space-y-6">
          <span className="inline-block bg-brand-primary/20 border border-brand-primary/40 rounded-full px-3.5 py-1 text-xs font-bold text-blue-300 uppercase tracking-widest animate-pulse">
            ✨ Featured Fandom: {slides[currentSlide].subtitle}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            {slides[currentSlide].desc}
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full mx-auto justify-center">
            <input
              type="text"
              placeholder="Search wands, hoodies, mugs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 pl-5 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/15 text-slate-200 text-sm focus:border-brand-primary focus:bg-slate-900 outline-hidden transition-all shadow-lg"
            />
            <button 
              type="submit" 
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 shimmer-btn"
            >
              Search
            </button>
          </form>

          <div className="flex gap-4 pt-2 justify-center">
            <Link 
              to={slides[currentSlide].link}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all shimmer-btn"
            >
              Explore Collection →
            </Link>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-brand-primary' : 'bg-white/20'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Shop by Fandom Category Grid */}
      <section className="space-y-6 animate-fade-in-up delay-100">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Shop by Fandom</h2>
          <p className="text-xs text-slate-400 mt-1">Select your favorite realm of magic, sitcom, or music</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FANDOMS.map(fan => (
            <Link 
              key={fan.name} 
              to={`/products?fandom=${encodeURIComponent(fan.name)}`}
              className={`group relative overflow-hidden flex flex-col justify-between p-6 rounded-2xl border bg-gradient-to-br ${fan.gradient} transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${fan.glowColor} cursor-pointer h-52`}
            >
              {/* Immersive Fandom Background Image */}
              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <img 
                  src={fan.bgImage} 
                  alt="" 
                  className="w-full h-full object-cover opacity-12 group-hover:opacity-22 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
              </div>

              {/* Card Content Overlay */}
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950/40 border border-white/10 shadow-inner group-hover:border-white/20 transition-colors duration-500">
                    <fan.icon className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-4 group-hover:text-brand-primary transition-colors">
                    {fan.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {fan.desc}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-white mt-4 flex items-center gap-1">
                  Enter Fandom Store <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Trending items */}
      <section className="space-y-6 animate-fade-in-up delay-200">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">Featured Merchandise</h2>
            <p className="text-xs text-slate-400 mt-1">Hand-picked hot items from our premium catalog</p>
          </div>
          <Link 
            to="/products" 
            className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
          >
            View Full Collection <span className="text-sm">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust & Features Banner */}
      <section className="p-6 md:p-8 rounded-3xl glass border border-white/5 bg-slate-900/30 animate-fade-in-up delay-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On all orders above ₹500.00' },
            { icon: '🛡️', title: 'Premium Replicas', desc: 'Officially styled and detailed' },
            { icon: '🔒', title: 'Secure Checkout', desc: 'SSL encrypted payment system' },
            { icon: '💬', title: 'Fandom Support', desc: 'Available 24/7 for order help' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <span className="text-3xl filter drop-shadow-md">{item.icon}</span>
              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;