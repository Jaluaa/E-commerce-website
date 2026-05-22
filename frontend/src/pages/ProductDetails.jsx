import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastContext';
import productsData from '../data/products';
import ProductCard from '../components/ProductCard';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [localReviews, setLocalReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [heartPopping, setHeartPopping] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const found = productsData.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.images && found.images.length > 0 ? found.images[0] : '');
      setSelectedVariant(found.variants && found.variants.length > 0 ? found.variants[0] : '');
      setLocalReviews(found.reviews || []);
      setQuantity(1);
    } else {
      setProduct(null);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <span className="text-4xl">🔮</span>
        <h2 className="text-lg font-extrabold text-white mt-4">Merchandise Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The product you are looking for does not exist in our universe.</p>
        <Link to="/products" className="mt-6 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    setHeartPopping(true);
    setTimeout(() => setHeartPopping(false), 400);

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedVariant);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      showToast("Please fill in your name and comment.", "error");
      return;
    }
    const submitted = {
      name: newReview.name,
      rating: Number(newReview.rating),
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };
    setLocalReviews(prev => [submitted, ...prev]);
    setNewReview({ name: '', rating: 5, comment: '' });
  };

  // Find other products from the same fandom as related products
  const relatedProducts = productsData
    .filter(p => p.fandom === product.fandom && p.id !== product.id)
    .slice(0, 4);

  // Recalculate average rating dynamically from reviews
  const avgRating = localReviews.length > 0
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length).toFixed(1)
    : product.rating.toFixed(1);

  const fandomThemes = {
    'Harry Potter': {
      bgGlow: 'from-amber-600/10 via-yellow-950/5 to-transparent',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300'
    },
    'Friends': {
      bgGlow: 'from-emerald-600/10 via-teal-950/5 to-transparent',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
    },
    'K-pop': {
      bgGlow: 'from-fuchsia-600/10 via-purple-950/5 to-transparent',
      badge: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300'
    },
    'K-drama': {
      bgGlow: 'from-cyan-600/10 via-blue-950/5 to-transparent',
      badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
    }
  };

  const theme = fandomThemes[product.fandom] || {
    bgGlow: 'from-blue-600/10 via-slate-950/5 to-transparent',
    badge: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-8 space-y-16 pb-20 overflow-hidden">
      {/* Dynamic Fandom Ambient Glow Backdrop */}
      <div className={`absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br ${theme.bgGlow} rounded-full blur-3xl opacity-50 -z-10 pointer-events-none`} />
      
      {/* Back to Home Button */}
      <div className="pt-4 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      {/* 2-Column Split Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden glass aspect-square bg-slate-900/40 border border-white/5">
            <img 
              src={activeImage} 
              alt={product.title} 
              className="w-full h-full object-cover transition-all duration-300"
            />
            {/* Wishlist button floating on top-right */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/70 border border-white/10 text-lg shadow-2xl backdrop-blur-md transition-all active:scale-95 ${heartPopping ? 'animate-heart-pop' : ''}`}
            >
              {inWishlist ? (
                <span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">❤️</span>
              ) : (
                <span className="text-slate-300">🤍</span>
              )}
            </button>
          </div>

          {/* Sub Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${activeImage === img ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-white/10 hover:border-white/20'}`}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Controls */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Category and Fandom Badges */}
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 border border-white/5 text-slate-400 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                {product.fandom}
              </span>
              <span className={`border font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${theme.badge}`}>
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating and Price */}
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-1.5 text-slate-100 font-extrabold text-sm bg-white/5 border border-white/5 px-3 py-1 rounded-full text-amber-400">
                ⭐ {avgRating} <span className="text-slate-400 font-normal">({localReviews.length} reviews)</span>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white">
                ₹{product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            <div className="h-px bg-white/5" />

            {/* Variant Tabs Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Choose Variant / Style
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedVariant === v ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white border-transparent shadow-lg shadow-brand-primary/15 scale-105' : 'bg-slate-900/40 border-white/10 text-slate-300 hover:border-white/20'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Warning Box */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Availability Status:</span>
              <strong className={`font-bold uppercase tracking-wider ${product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} items left!` : 'Out of Stock'}
              </strong>
            </div>

          </div>

          {/* Add to Cart Actions */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
            {/* Quantity select */}
            {product.stock > 0 && (
              <div className="flex items-center bg-slate-950 border border-white/10 rounded-xl overflow-hidden h-12 flex-shrink-0">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 text-slate-400 hover:text-white font-bold h-full transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-white text-xs font-black">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-4 text-slate-400 hover:text-white font-bold h-full transition-colors"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-sm font-bold shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {product.stock > 0 ? `Add to Cart` : 'Out of Stock'}
            </button>
          </div>

        </div>

      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">Related Merchandise</h2>
            <p className="text-xs text-slate-400 mt-1">Other products in the {product.fandom} fandom store</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        
        {/* Left pane: Review statistics and submission */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">Customer Reviews</h2>
            <p className="text-xs text-slate-400 mt-1">Read reviews or write a custom review feedback</p>
          </div>

          {/* Average stat panel */}
          <div className="p-6 rounded-2xl glass border border-white/5 flex flex-col items-center text-center space-y-2">
            <span className="text-4xl font-black text-white">{avgRating}</span>
            <div className="flex text-amber-400 text-lg">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(avgRating) ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-xs text-slate-400">Based on {localReviews.length} community feedbacks</span>
          </div>

          {/* Write a review Form */}
          <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl glass border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Write a Mock Review</h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Harry Potter"
                value={newReview.name}
                onChange={e => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Rating Star</label>
              <select
                value={newReview.rating}
                onChange={e => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden cursor-pointer"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                <option value="3">⭐⭐⭐ (3 Star)</option>
                <option value="2">⭐⭐ (2 Star)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Comment Content</label>
              <textarea
                rows="3"
                placeholder="Tell us what you think of this replica..."
                value={newReview.comment}
                onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Submit Review Feedback
            </button>
          </form>
        </div>

        {/* Right pane: Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          {localReviews.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {localReviews.map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl glass border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-slate-100 font-extrabold">{rev.name}</strong>
                    <span className="text-slate-500">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass rounded-2xl border border-white/5">
              <span className="text-3xl">🗣️</span>
              <h3 className="text-sm font-bold text-slate-200 mt-3">No reviews yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                Be the first to review this product and share your thoughts!
              </p>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}

export default ProductDetails;

