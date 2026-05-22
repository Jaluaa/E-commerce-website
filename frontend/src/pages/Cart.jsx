import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FANDOM20') {
      setDiscountPercent(20);
      setPromoApplied(true);
      alert("Success! 20% Promo code discount applied to your cart.");
    } else {
      alert("Invalid promo code! Try using 'FANDOM20' for 20% off.");
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setPromoApplied(false);
    setPromoCode('');
  };

  const subtotal = getCartTotal();
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 5.00;
  const finalTotal = subtotal - discountAmount + shippingFee;

  const handleProceedToCheckout = () => {
    // Save current calculations to session state or query params for checkout page
    navigate(`/checkout?discount=${discountPercent}`);
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl filter drop-shadow-md">🛒</span>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">Shopping Basket</h1>
          <p className="text-xs text-slate-400 mt-1">Review and manage your selected fandom collectibles and merchandise</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 glass rounded-3xl border border-white/5 max-w-xl mx-auto">
          <span className="text-5xl filter drop-shadow-md mb-6">🛍️</span>
          <h2 className="text-lg font-extrabold text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
            Looks like you haven't added any magic to your basket yet. Let's head over to the catalog store!
          </p>
          <Link 
            to="/products" 
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all"
          >
            Explore Fandom Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Basket List (Left Column) */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
              const product = item.product;
              const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';
              return (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl glass border border-white/5 bg-slate-900/10 items-center justify-between">
                  
                  {/* Thumbnail and Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img 
                      src={displayImage} 
                      alt={product.title} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-white/5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">
                        {product.fandom}
                      </span>
                      <Link to={`/products/${product.id}`} className="hover:underline">
                        <h3 className="text-sm md:text-base font-extrabold text-white truncate">
                          {product.title}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Style: <span className="text-slate-200 font-semibold">{item.variant}</span>
                        </p>
                      )}
                      <p className="text-xs font-black text-brand-accent mt-1.5 md:hidden">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Right side: controls, price & delete */}
                  <div className="flex items-center gap-6">
                    {/* Unit Price */}
                    <span className="hidden md:inline text-sm font-extrabold text-slate-200">
                      ${product.price.toFixed(2)}
                    </span>

                    {/* Quantity selectors */}
                    <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg overflow-hidden h-9">
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity - 1, item.variant)}
                        className="px-2.5 text-slate-400 hover:text-white font-bold h-full transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-white text-[11px] font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity + 1, item.variant)}
                        className="px-2.5 text-slate-400 hover:text-white font-bold h-full transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <span className="text-sm md:text-base font-black text-white min-w-[70px] text-right">
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(product.id, item.variant)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 cursor-pointer transition-colors"
                      title="Remove product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Pricing Summary Pane (Right Column) */}
          <div className="space-y-6">
            
            {/* Promo Code card */}
            <div className="p-5 rounded-2xl glass border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Apply Promo Code</h3>
              {promoApplied ? (
                <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
                  <div className="text-xs text-emerald-400 font-bold">
                    🎉 Code 'FANDOM20' Applied (-20%)
                  </div>
                  <button 
                    onClick={handleRemovePromo}
                    className="text-[10px] font-black text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter FANDOM20"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 uppercase focus:border-brand-primary outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs text-slate-200 transition-all active:scale-95"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price detail card */}
            <div className="p-6 rounded-2xl glass border border-white/5 space-y-4">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest pb-3 border-b border-white/5">
                Summary Breakdowns
              </h3>
              
              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount (20%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-bold text-slate-200">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                
                {shippingFee > 0 && (
                  <p className="text-[10px] text-slate-500 text-right leading-tight">
                    Add ${(50 - subtotal).toFixed(2)} more to unlock FREE shipping!
                  </p>
                )}
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-200">Final Balance:</span>
                <span className="text-xl font-black text-white">${finalTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all text-center block"
              >
                Proceed to Checkout 💳
              </button>

              <Link 
                to="/products"
                className="block text-center text-xs text-slate-400 hover:text-slate-300 font-bold transition-all pt-2"
              >
                ← Continue Shopping
              </Link>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Cart;

