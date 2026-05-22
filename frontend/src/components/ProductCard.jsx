import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useState } from 'react';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [heartPopping, setHeartPopping] = useState(false);

  const id = product.id;
  const inWishlist = isInWishlist(id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setHeartPopping(true);
    setTimeout(() => setHeartPopping(false), 400);

    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  // Safe image display
  const displayImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-primary/10">
      {/* Floating Fandom Badge */}
      <div className="absolute top-4 left-4 z-10 rounded-full bg-slate-950/60 px-3 py-1 text-[10px] font-semibold text-brand-primary backdrop-blur-md border border-white/5 uppercase tracking-wider">
        {product.fandom}
      </div>

      {/* Floating Wishlist Heart */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/60 text-base border border-white/10 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-900 active:scale-95 ${heartPopping ? 'animate-heart-pop' : ''}`}
        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {inWishlist ? (
          <span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">❤️</span>
        ) : (
          <span className="text-slate-400">🤍</span>
        )}
      </button>

      {/* Product Image */}
      <Link to={`/products/${id}`} className="block overflow-hidden rounded-xl bg-slate-900/40">
        <img 
          src={displayImage} 
          alt={product.title} 
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </Link>

      {/* Content */}
      <div className="mt-4 flex flex-col flex-grow">
        {/* Category & Rating */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1">
          <span>{product.category}</span>
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-amber-400 font-bold">
            ⭐ {product.rating.toFixed(1)}
          </div>
        </div>

        {/* Title */}
        <Link to={`/products/${id}`} className="mt-1">
          <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-brand-primary transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
          {product.description}
        </p>

        {/* Bottom Panel */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-lg font-extrabold text-white">
            ₹{product.price.toFixed(2)}
          </span>
          
          <button
            onClick={() => addToCart(id, 1)}
            disabled={product.stock === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-primary to-brand-accent hover:brightness-115"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;