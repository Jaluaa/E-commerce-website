import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productsData from '../data/products';

const FANDOMS = ['Harry Potter', 'Friends', 'K-pop', 'K-drama'];

const CATEGORY_MAP = {
  'Harry Potter': ['Hoodies', 'Keychains', 'Tshirts'],
  'Friends': ['Mugs', 'Hoodies', 'Tshirts'],
  'K-pop': ['BLACKPINK', 'twice', 'itzy', 'red velvet'],
  'K-drama': ['Tshirts']
};

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  
  // Filter States
  const [searchVal, setSearchVal] = useState('');
  const [selectedFandoms, setSelectedFandoms] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);

  // Sync state with URL params on mount & param change
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const fandom = searchParams.get('fandom') || '';
    const category = searchParams.get('category') || '';

    setSearchVal(search);
    setSelectedFandoms(fandom ? [fandom] : []);
    setSelectedCategories(category ? [category] : []);
    setMaxPrice(100);
    setMinRating(0);
    setVisibleCount(6);
  }, [searchParams]);

  // Handle Filtering
  useEffect(() => {
    let filtered = [...productsData];

    // Search text filter
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.fandom.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Fandoms filter
    if (selectedFandoms.length > 0) {
      filtered = filtered.filter(p => selectedFandoms.includes(p.fandom));
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter
    filtered = filtered.filter(p => p.price <= maxPrice);

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    setProducts(filtered);
    setVisibleCount(6);
  }, [searchVal, selectedFandoms, selectedCategories, maxPrice, minRating]);

  const toggleFandom = (fandom) => {
    setSelectedFandoms(prev => {
      const next = prev.includes(fandom) ? prev.filter(x => x !== fandom) : [...prev, fandom];
      return next;
    });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(x => x !== category) : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setSearchVal('');
    setSelectedFandoms([]);
    setSelectedCategories([]);
    setMaxPrice(100);
    setMinRating(0);
  };

  // Get categories available based on selected fandoms (or all if none selected)
  const activeCategories = Array.from(new Set(
    selectedFandoms.length > 0
      ? selectedFandoms.reduce((acc, f) => [...acc, ...(CATEGORY_MAP[f] || [])], [])
      : Object.values(CATEGORY_MAP).flat()
  ));

  // Determine if a single fandom is currently being viewed
  const activeFandom = selectedFandoms.length === 1 ? selectedFandoms[0] : null;

  const fandomBanners = {
    'Harry Potter': {
      title: 'Harry Potter Wizarding Store',
      desc: 'Step into the legendary world of Hogwarts with hand-crafted wands, crest keychains, and house hoodies.',
      bgImage: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?q=80&w=1200&auto=format&fit=crop',
      gradient: 'from-amber-600/30 via-yellow-950/60 to-slate-950/90',
      accentColor: 'text-amber-400'
    },
    'Friends': {
      title: 'Central Perk Friends Store',
      desc: 'Unwind with official Central Perk oversized cups, lobster designs, and cozy NYC sitcom apparel.',
      bgImage: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1200&auto=format&fit=crop',
      gradient: 'from-emerald-600/30 via-teal-950/60 to-slate-950/90',
      accentColor: 'text-emerald-400'
    },
    'K-pop': {
      title: 'Ultimate K-pop Music Store',
      desc: 'Get your official comeback concert albums, limited photocard sets, and premium idol tour hoodies.',
      bgImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
      gradient: 'from-fuchsia-600/30 via-purple-950/60 to-slate-950/90',
      accentColor: 'text-fuchsia-400'
    },
    'K-drama': {
      title: 'Romantic K-drama Store',
      desc: 'Celebrate your favorite shows with destiny symbolic jewelry, scenic watercolor garments, and minimalist merchandise.',
      bgImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop',
      gradient: 'from-cyan-600/30 via-blue-950/60 to-slate-950/90',
      accentColor: 'text-cyan-400'
    }
  };

  const banner = activeFandom ? fandomBanners[activeFandom] : {
    title: 'Explore Our Fandoms',
    desc: 'Discover officially styled wands, albums, oversized hoodies and high-quality collectibles.',
    bgImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1200&auto=format&fit=crop',
    gradient: 'from-slate-900/60 via-slate-950/80 to-slate-950/95',
    accentColor: 'text-brand-primary'
  };

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

      {/* Dynamic Fandom Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass border border-white/5 p-6 md:p-8 lg:p-12 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 min-h-[180px] transition-all duration-700">
        {/* Banner Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={banner.bgImage} 
            alt="" 
            className="w-full h-full object-cover opacity-20 transition-all duration-700"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 space-y-2 text-center md:text-left max-w-2xl">
          <span className={`inline-block px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest ${banner.accentColor} animate-pulse`}>
            {activeFandom ? 'Active Fandom Store' : 'Universal Catalog'}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-wide leading-tight">
            {banner.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {banner.desc}
          </p>
        </div>

        {/* Text Search input (beautiful glass search container inside banner) */}
        <div className="relative z-10 w-full md:w-80">
          <input
            type="text"
            placeholder="Type to filter catalog..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-white/15 text-slate-200 text-sm focus:border-brand-primary outline-hidden transition-all shadow-xl"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 glass rounded-3xl p-6 h-fit space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Filters</h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-brand-primary hover:text-brand-accent transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Fandoms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fandom</h4>
            <div className="space-y-2">
              {FANDOMS.map(f => (
                <label key={f} className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedFandoms.includes(f)}
                    onChange={() => toggleFandom(f)}
                    className="rounded-sm border-white/10 bg-slate-950/40 text-brand-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeCategories.map(c => (
                <label key={c} className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="rounded-sm border-white/10 bg-slate-950/40 text-brand-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wide">Max Price</h4>
              <span className="font-black text-white">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-primary bg-white/10 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="h-px bg-white/5" />

          {/* Star Rating */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Minimum Rating</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setMinRating(minRating === star ? 0 : star)}
                  className={`text-base transition-transform active:scale-90 ${star <= minRating ? 'text-amber-400' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
              {minRating > 0 && <span className="text-[10px] text-slate-400 ml-1">({minRating}+ Stars)</span>}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Found <b>{products.length}</b> magical items</span>
          </div>

          {products.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.slice(0, visibleCount).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              
              {visibleCount < products.length && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Load More ✨
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-16 glass rounded-3xl border border-white/5">
              <span className="text-4xl filter drop-shadow-md">🔍</span>
              <h3 className="text-base font-extrabold text-white mt-4">No Merch Found</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                No items match your active filters or text search query. Let\'s try reset things!
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default ProductList;
