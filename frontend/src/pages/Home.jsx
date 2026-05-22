import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productsData from '../data/products';

const FANDOMS = [
  { 
    name: 'Harry Potter', 
    emoji: '🧙‍♂️', 
    desc: 'Wands, Alumni Hoodies, and Collectibles',
    gradient: 'from-amber-600/20 to-yellow-950/40 border-amber-500/30 hover:border-amber-500/50',
    color: '#eab308',
    bgImage: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-amber-500/10'
  },
  { 
    name: 'Friends', 
    emoji: '☕', 
    desc: 'Central Perk Mugs, Lobsters, and Decor',
    gradient: 'from-emerald-600/20 to-teal-950/40 border-emerald-500/30 hover:border-emerald-500/50',
    color: '#10b981',
    bgImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-emerald-500/10'
  },
  { 
    name: 'K-pop', 
    emoji: '🎤', 
    desc: 'Official Lightsticks, Albums, and Hoodies',
    gradient: 'from-fuchsia-600/20 to-purple-950/40 border-fuchsia-500/30 hover:border-fuchsia-500/50',
    color: '#d946ef',
    bgImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    glowColor: 'group-hover:shadow-fuchsia-500/10'
  },
  { 
    name: 'K-drama', 
    emoji: '🎬', 
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 pb-20">
      
      {/* Sliding Hero Carousel Banner */}
      <div className="relative rounded-3xl overflow-hidden glass h-[460px] md:h-[500px]">
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
            >
              Search
            </button>
          </form>

          <div className="flex gap-4 pt-2 justify-center">
            <Link 
              to={slides[currentSlide].link}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all"
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
      <section className="space-y-6">
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
                  <span className="text-3xl filter drop-shadow-md">{fan.emoji}</span>
                  <h3 className="text-lg font-extrabold text-white mt-3 group-hover:text-brand-primary transition-colors">
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
      <section className="space-y-6">
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
      <section className="p-6 md:p-8 rounded-3xl glass border border-white/5 bg-slate-900/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On all orders above $50.00' },
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