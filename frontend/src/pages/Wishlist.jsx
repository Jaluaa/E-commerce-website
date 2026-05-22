import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (productId) => {
    // Add to cart and remove from wishlist
    addToCart(productId, 1);
    removeFromWishlist(productId);
    showToast("Moved item to your shopping cart!", "success");
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

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl filter drop-shadow-md">❤️</span>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">My Wishlist</h1>
          <p className="text-xs text-slate-400 mt-1">Keep track of your favorite fandom merchandise and replicas</p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 glass rounded-3xl border border-white/5 max-w-xl mx-auto">
          <span className="text-5xl filter drop-shadow-md mb-6">🤍</span>
          <h2 className="text-lg font-extrabold text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            You haven't saved any fandom items yet. Click the heart icon on any product page or catalog card to keep it here!
          </p>
          <Link 
            to="/products" 
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            You have saved <b>{wishlistItems.length}</b> {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                
                {/* Move to Cart Floating Action Button */}
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  className="absolute bottom-20 left-4 right-4 z-10 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-bold text-white text-center backdrop-blur-md opacity-0 group-hover:opacity-100 active:scale-95 transition-all duration-300"
                >
                  Move to Shopping Cart ⚡
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Wishlist;

