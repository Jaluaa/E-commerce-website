import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

function Checkout() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const discountParam = searchParams.get('discount');
  const discountPercent = discountParam ? parseInt(discountParam, 10) : 0;

  const { showToast } = useToast();

  // Multi-step state: 'shipping' | 'payment' | 'submitting' | 'success'
  const [checkoutStep, setCheckoutStep] = useState('shipping');

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: user ? user.email : '',
    address: '',
    city: '',
    zip: '',
    country: 'India',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'credit_card' | 'paypal' | 'cod'

  // Credit Card Interactive Widget states
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [errors, setErrors] = useState({});
  const [placedOrderId, setPlacedOrderId] = useState('');

  // CVV Card-Flipping Anim Methods
  const handleCvvFocus = () => setIsCardFlipped(true);
  const handleCvvBlur = () => setIsCardFlipped(false);

  // Dynamic Razorpay SDK Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Mock overlay controls
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderData, setMockOrderData] = useState(null);

  // Sync logged-in user email
  useEffect(() => {
    if (user && user.email) {
      setShippingAddress(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Check if cart is empty
  if (cartItems.length === 0 && checkoutStep !== 'submitting' && checkoutStep !== 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center animate-fade-in-up delay-150">
        <span className="text-6xl filter drop-shadow-md mb-6">🛒</span>
        <h2 className="text-xl font-extrabold text-white">Your Shopping Basket is Empty</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          Please add some fandom merchandise to your cart before proceeding to checkout!
        </p>
        <Link 
          to="/products" 
          className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-lg shadow-brand-primary/10 hover:brightness-110 active:scale-95 transition-all shimmer-btn"
        >
          Browse Merchandise
        </Link>
      </div>
    );
  }

  // Calculate receipt totals in natively scaled INR (free shipping over ₹4000, flat ₹400 shipping below)
  const subtotal = getCartTotal();
  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingCost = (subtotal - discountAmount) > 4000 || (subtotal - discountAmount) === 0 ? 0 : 400.00;
  const tax = (subtotal - discountAmount) * 0.08;
  const orderTotal = subtotal - discountAmount + shippingCost + tax;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!user && !shippingAddress.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!user && !/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!shippingAddress.address.trim()) newErrors.address = 'Street Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.zip.trim()) newErrors.zip = 'ZIP/Postal code is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const formatted = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
      setCardDetails(prev => ({ ...prev, number: formatted }));
    } else if (name === 'expiry') {
      const formatted = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().substring(0, 5);
      if (formatted.endsWith('/')) {
        setCardDetails(prev => ({ ...prev, expiry: formatted.slice(0, -1) }));
      } else {
        setCardDetails(prev => ({ ...prev, expiry: formatted }));
      }
    } else if (name === 'cvv') {
      setCardDetails(prev => ({ ...prev, cvv: value.replace(/\D/g, '').substring(0, 3) }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validatePayment = () => {
    if (paymentMethod !== 'credit_card') return true;
    const newErrors = {};
    if (cardDetails.number.length < 19) newErrors.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';
    if (cardDetails.expiry.length < 5) newErrors.cardExpiry = 'Enter MM/YY expiry';
    if (cardDetails.cvv.length < 3) newErrors.cardCvv = 'Enter 3-digit CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setCheckoutStep('payment');
    }
  };

  // Save order details to client-side localStorage under user email or guest
  const saveLocalOrderHistory = (finalOrderId, displayMethod) => {
    const emailKey = user ? user.email : (shippingAddress.email || 'guest');
    const storedOrdersKey = `orders_${emailKey}`;
    
    const localOrder = {
      id: finalOrderId,
      createdAt: new Date().toISOString(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        variant: item.variant
      })),
      total: orderTotal,
      subtotal,
      discountAmount,
      shippingCost,
      tax,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: emailKey,
        address: shippingAddress.address,
        city: shippingAddress.city,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        phone: shippingAddress.phone
      },
      paymentMethod: displayMethod,
      status: 'completed'
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem(storedOrdersKey) || '[]');
      existingOrders.unshift(localOrder);
      localStorage.setItem(storedOrdersKey, JSON.stringify(existingOrders));
    } catch (e) {
      console.error("Error writing order to localStorage:", e);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'razorpay') {
      setCheckoutStep('submitting');
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setCheckoutStep('payment');
        showToast("Failed to load Razorpay SDK. Please check your internet connection.", "error");
        return;
      }

      try {
        const response = await api.post('/payment/razorpay/order', {
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName,
            address: shippingAddress.address,
            city: shippingAddress.city,
            zip: shippingAddress.zip,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          }
        });

        const { orderId, razorpayOrderId, amount, keyId, isMock } = response.data;

        if (isMock) {
          setMockOrderData({
            orderId,
            razorpayOrderId,
            amount,
            keyId
          });
          setShowMockModal(true);
          setCheckoutStep('payment');
        } else {
          const options = {
            key: keyId,
            amount: amount,
            currency: "INR",
            name: "FandomRealm Store 🧙‍♂️",
            description: "Secure Sandbox Checkout",
            order_id: razorpayOrderId,
            theme: {
              color: "#8b5cf6"
            },
            prefill: {
              name: shippingAddress.fullName,
              email: shippingAddress.email || user?.email,
              contact: shippingAddress.phone
            },
            handler: async function (res) {
              setCheckoutStep('submitting');
              try {
                const verifyRes = await api.post('/payment/razorpay/verify', {
                  orderId,
                  razorpayOrderId: res.razorpay_order_id,
                  razorpayPaymentId: res.razorpay_payment_id,
                  razorpaySignature: res.razorpay_signature
                });

                if (verifyRes.data.success) {
                  saveLocalOrderHistory(orderId, 'Razorpay (Free Tests)');
                  setPlacedOrderId(orderId);
                  showToast("Payment verified successfully!", "success");
                  setTimeout(() => {
                    setCheckoutStep('success');
                    clearCart();
                  }, 1000);
                } else {
                  setCheckoutStep('payment');
                  showToast("Payment verification failed.", "error");
                }
              } catch (err) {
                console.error("Verification error:", err);
                setCheckoutStep('payment');
                showToast("Payment verification error.", "error");
              }
            },
            modal: {
              ondismiss: function () {
                setCheckoutStep('payment');
              }
            }
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.open();
        }
      } catch (error) {
        console.error("Failed to create payment order:", error);
        setCheckoutStep('payment');
        showToast(error.response?.data?.error || "Error initiating payment checkout.", "error");
      }
      return;
    }

    if (!validatePayment()) return;

    setCheckoutStep('submitting');
    
    // Create local order ID
    const localId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setPlacedOrderId(localId);

    const displayMethod = paymentMethod === 'credit_card' 
      ? 'Credit Card' 
      : paymentMethod === 'paypal' 
        ? 'PayPal' 
        : 'Cash on Delivery';

    // Attempt backend placement if logged in
    let backendSuccess = false;
    if (user) {
      try {
        await api.post('/orders/checkout', {
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          shippingAddress: {
            fullName: shippingAddress.fullName,
            address: shippingAddress.address,
            city: shippingAddress.city,
            zip: shippingAddress.zip,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          },
          paymentMethod: displayMethod
        });
        backendSuccess = true;
      } catch (error) {
        console.error("Backend checkout failed, falling back to local history storage", error);
      }
    }

    saveLocalOrderHistory(localId, displayMethod);

    // Process submission transition
    setTimeout(() => {
      setCheckoutStep('success');
      clearCart();
    }, 1500);
  };

  const getCardTypeLogo = (num) => {
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return '🇺🇸 Visa';
    if (cleanNum.startsWith('5')) return '💳 Mastercard';
    if (cleanNum.startsWith('3')) return '🌟 Amex';
    return '🌐 Card';
  };

  if (checkoutStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 md:p-12 rounded-3xl glass border border-white/5 space-y-6 flex flex-col items-center animate-fade-in-up">
          {/* Animated Glowing Ring & Tick */}
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400 animate-pulse shadow-lg shadow-emerald-500/10">
            ✓
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              Order Placed Successfully!
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you for shopping with Fandom Store! Your merchandise receipt is ready, and your magic parcel is being packed.
            </p>
          </div>

          {/* Local Order Reference */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 w-full max-w-md font-mono text-left space-y-2.5 text-xs text-slate-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Order Reference:</span>
              <strong className="text-white font-extrabold uppercase">{placedOrderId.replace('ord_', '#')}</strong>
            </div>
            <div className="flex justify-between">
              <span>Recipient Email:</span>
              <span className="text-slate-200">{user ? user.email : shippingAddress.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Final Total Paid:</span>
              <strong className="text-brand-accent font-extrabold">₹{orderTotal.toFixed(2)}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-xs shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all shimmer-btn"
            >
              View Order History 📦
            </button>
            <Link
              to="/products"
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-xs text-center transition-all active:scale-95"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
      
      {/* Back to Home Button */}
      <div className="pt-4 mb-6 animate-fade-in-up">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up delay-75">
        <span className="text-3xl filter drop-shadow-md">🔒</span>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">Secure Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Provide your delivery information and finalize your payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Checkout Multi-step Form */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl glass border border-white/5 space-y-6 animate-fade-in-up delay-150">
          
          {/* Custom Visual Timeline Timeline */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/5">
            <div className={`flex items-center gap-2 transition-all ${checkoutStep === 'shipping' ? 'opacity-100 scale-105' : 'opacity-50'}`}>
              <span className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span className="text-xs font-bold text-white tracking-wide">Shipping Address</span>
            </div>
            
            <div className="flex-1 h-px bg-white/5" />

            <div className={`flex items-center gap-2 transition-all ${checkoutStep === 'payment' ? 'opacity-100 scale-105' : 'opacity-50'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${checkoutStep === 'payment' ? 'bg-brand-primary text-white' : 'bg-slate-900 border border-white/10 text-slate-400'}`}>
                2
              </span>
              <span className="text-xs font-bold text-slate-200 tracking-wide">Secure Payment</span>
            </div>
          </div>

          {checkoutStep === 'shipping' && (
            <form onSubmit={handleNextToPayment} className="space-y-4 pt-2">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                    placeholder="Harry Potter"
                  />
                  {errors.fullName && <div className="text-red-400 text-[10px] font-bold">{errors.fullName}</div>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    disabled={!!user}
                    onChange={handleShippingChange}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="wizard@hogwarts.edu"
                  />
                  {errors.email && <div className="text-red-400 text-[10px] font-bold">{errors.email}</div>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                  placeholder="4 Privet Drive"
                />
                {errors.address && <div className="text-red-400 text-[10px] font-bold">{errors.address}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                    placeholder="Little Whinging"
                  />
                  {errors.city && <div className="text-red-400 text-[10px] font-bold">{errors.city}</div>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={shippingAddress.zip}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                    placeholder="SUR 3EJ"
                  />
                  {errors.zip && <div className="text-red-400 text-[10px] font-bold">{errors.zip}</div>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden"
                  placeholder="+44 7700 900077"
                />
                {errors.phone && <div className="text-red-400 text-[10px] font-bold">{errors.phone}</div>}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link to="/cart" className="text-xs text-slate-400 hover:text-white font-bold transition-all">
                  ← Back to Cart
                </Link>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all shimmer-btn"
                >
                  Continue to Payment →
                </button>
              </div>
            </form>
          )}

          {checkoutStep === 'payment' && (
            <div className="space-y-6 pt-2">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Select Payment Method</h2>
              
              {/* Payment Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'razorpay', label: '💳 Razorpay', desc: 'Free Tests' },
                  { id: 'credit_card', label: '🔒 Card', desc: 'Interactive Card' },
                  { id: 'paypal', label: '🅿️ PayPal', desc: 'PayPal Account' },
                  { id: 'cod', label: '💵 COD', desc: 'Cash on Delivery' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => { setPaymentMethod(method.id); setErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${paymentMethod === method.id ? 'bg-brand-primary/10 border-brand-primary text-white ring-2 ring-brand-primary/10 scale-102' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'}`}
                  >
                    <div className="text-sm font-extrabold">{method.label}</div>
                    <div className="text-[9px] text-slate-500 mt-1 font-semibold">{method.desc}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="space-y-6">
                  
                  {/* Interactive Glowing Holographic 3D Flipping Credit Card Widget */}
                  <div className="relative w-full max-w-sm mx-auto h-48 md:h-52 [perspective:1000px] select-none my-2">
                    <div className={`relative w-full h-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      
                      {/* Front Side */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-tr from-brand-primary via-purple-700 to-brand-accent border border-white/20 text-white shadow-2xl [backface-visibility:hidden] flex flex-col justify-between overflow-hidden">
                        {/* Glowing reflection gloss */}
                        <div className="absolute -inset-x-20 -top-20 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center z-10">
                          <span className="text-[10px] font-black tracking-widest text-slate-200">FANDOM NEXUS CARD</span>
                          <span className="text-xs font-black bg-white/15 px-2 py-0.5 rounded border border-white/10">
                            {getCardTypeLogo(cardDetails.number)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 z-10 mt-1">
                          <div className="w-9 h-6.5 rounded bg-gradient-to-br from-amber-300 to-amber-500 shadow-md border border-amber-200/20" />
                          <svg className="w-5 h-5 text-slate-300 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a9 9 0 0 1-9-9v-1.5m9 10.5a12 12 0 0 0 12-12V6m-12 12a15 15 0 0 1-15-15V3" />
                          </svg>
                        </div>
                        
                        <div className="z-10 py-1">
                          <div className="text-base md:text-lg font-mono tracking-[3px] font-black text-white/95 text-center">
                            {cardDetails.number || '•••• •••• •••• ••••'}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end z-10">
                          <div className="min-w-0 pr-2">
                            <div className="text-[7px] uppercase tracking-wider text-slate-300 font-bold">Cardholder</div>
                            <div className="text-[11px] font-extrabold text-white truncate max-w-[200px] uppercase">
                              {cardDetails.name || 'YOUR NAME'}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="text-[7px] uppercase tracking-wider text-slate-300 font-bold">Expires</div>
                            <div className="text-[11px] font-mono font-extrabold text-white">
                              {cardDetails.expiry || 'MM/YY'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-slate-900 border border-white/20 text-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between py-5 overflow-hidden">
                        {/* Magnetic Strip */}
                        <div className="w-full h-9 bg-slate-950 mt-1" />
                        
                        {/* Signature & CVV Panel */}
                        <div className="px-5 flex items-center gap-3 mt-4">
                          <div className="flex-1 h-7 bg-slate-200 rounded flex items-center justify-end px-3 text-slate-800 font-mono italic font-bold text-[10px] select-none">
                            {cardDetails.name ? cardDetails.name.substring(0, 15) : 'Authorized Signature'}
                          </div>
                          <div className="w-12 h-7 bg-white text-slate-950 rounded flex items-center justify-center font-mono font-black text-xs tracking-wider shadow-inner border border-slate-300">
                            {cardDetails.cvv || '•••'}
                          </div>
                        </div>
                        
                        <div className="px-5 text-[7px] text-slate-500 leading-normal text-justify mt-2">
                          This card is issued by Fandom Nexus Bank. By using this card, you agree to all terms and conditions.
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Form fields for Card */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden font-mono"
                        placeholder="4000 1234 5678 9010"
                      />
                      {errors.cardNumber && <div className="text-red-400 text-[10px] font-bold">{errors.cardNumber}</div>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        name="name"
                        value={cardDetails.name}
                        onChange={handleCardChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden uppercase"
                        placeholder="HARRY POTTER"
                      />
                      {errors.cardName && <div className="text-red-400 text-[10px] font-bold">{errors.cardName}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Expiration Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden font-mono"
                          placeholder="MM/YY"
                        />
                        {errors.cardExpiry && <div className="text-red-400 text-[10px] font-bold">{errors.cardExpiry}</div>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          onFocus={handleCvvFocus}
                          onBlur={handleCvvBlur}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 focus:border-brand-primary outline-hidden font-mono"
                          placeholder="123"
                        />
                        {errors.cardCvv && <div className="text-red-400 text-[10px] font-bold">{errors.cardCvv}</div>}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="text-center p-8 bg-blue-500/5 border border-dashed border-blue-500/20 rounded-2xl my-2">
                  <span className="text-4xl filter drop-shadow-md">🅿️</span>
                  <h3 className="text-sm font-bold text-slate-200 mt-3">PayPal Express Checkout</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    You will be redirected securely to the PayPal portal to approve your transaction after clicking 'Place Order'.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="text-center p-8 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-2xl my-2">
                  <span className="text-4xl filter drop-shadow-md">💵</span>
                  <h3 className="text-sm font-bold text-slate-200 mt-3">Cash on Delivery</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Zero prepayment required! Pay with physical cash, secure card, or mobile transfer instantly upon delivery.
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center gap-4">
                <button
                  onClick={() => setCheckoutStep('shipping')}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-xs transition-all active:scale-95"
                >
                  Back to Address
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all text-center shimmer-btn"
                >
                  Place Order & Pay 🚀
                </button>
              </div>

            </div>
          )}

          {checkoutStep === 'submitting' && (
            <div className="text-center py-16 space-y-4">
              <div className="border-4 border-white/10 w-12 h-12 rounded-full border-l-brand-primary animate-spin mx-auto" />
              <h3 className="text-base font-extrabold text-white">Validating and Processing Order...</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Securing your payment and sending your details. Please do not close or reload this browser.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary Receipt Grid */}
        <div className="p-6 rounded-3xl glass border border-white/5 space-y-5 lg:sticky lg:top-24 animate-fade-in-up delay-200">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest pb-3 border-b border-white/5">
            Order Receipt Summary
          </h2>
          
          {/* Scrollable Items Stack */}
          <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
            {cartItems.map((item, idx) => {
              const product = item.product;
              const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';
              return (
                <div key={idx} className="flex gap-3 items-center">
                  <img 
                    src={displayImage} 
                    alt={product.title} 
                    className="w-11 h-11 rounded-lg object-cover border border-white/5 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-200 flex-shrink-0">
                    ₹{(product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-white/5" />

          {/* Pricing breakdowns */}
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>FANDOM20 Code (-20%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="font-bold text-slate-200">
                {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-slate-200">₹{tax.toFixed(2)}</span>
            </div>

            <div className="h-px bg-white/5 !my-3" />

            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-200">Final Order Balance:</span>
              <span className="text-lg font-black text-brand-accent">₹{orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Glassmorphic Mock Razorpay Gateway Portal Overlay */}
      {showMockModal && mockOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4">
          <div className="glass max-w-md w-full p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col space-y-6 shadow-2xl shadow-brand-primary/20">
            {/* Ambient Background Lights */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-3xl filter drop-shadow-md">💳</span>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">Razorpay Free-Test Gateway</h3>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Simulated Sandbox Mode
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2.5 font-mono text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="text-white font-semibold">FandomRealm Store</span>
                </div>
                <div className="flex justify-between">
                  <span>Simulated Order ID:</span>
                  <span className="text-white select-all">{mockOrderData.razorpayOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <strong className="text-brand-accent font-extrabold">₹{(mockOrderData.amount / 100).toFixed(2)}</strong>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span>Currency:</span>
                  <span className="text-slate-200">INR (₹)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                ℹ️ No Razorpay test keys were configured in <code>backend/.env</code>. The backend successfully initiated this mock order. Select an action below to test the end-to-end webhook-verification database cycle.
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  setShowMockModal(false);
                  setCheckoutStep('submitting');
                  try {
                    const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
                    const mockSignature = `mock_signature_${Math.random().toString(36).substring(2, 12)}`;
                    
                    const verifyRes = await api.post('/payment/razorpay/verify', {
                      orderId: mockOrderData.orderId,
                      razorpayOrderId: mockOrderData.razorpayOrderId,
                      razorpayPaymentId: mockPaymentId,
                      razorpaySignature: mockSignature
                    });

                    if (verifyRes.data.success) {
                      saveLocalOrderHistory(mockOrderData.orderId, 'Razorpay (Simulated Sandbox)');
                      setPlacedOrderId(mockOrderData.orderId);
                      showToast("Simulated Sandbox transaction approved!", "success");
                      setTimeout(() => {
                        setCheckoutStep('success');
                        clearCart();
                      }, 1000);
                    } else {
                      setCheckoutStep('payment');
                      showToast("Simulated validation rejected.", "error");
                    }
                  } catch (err) {
                    console.error("Verification error:", err);
                    setCheckoutStep('payment');
                    showToast("Simulated validation error.", "error");
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/10 cursor-pointer text-center shimmer-btn"
              >
                Simulate Payment Success ✨
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMockModal(false);
                  setCheckoutStep('payment');
                  showToast("Payment simulated failure or cancelled.", "error");
                }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
              >
                Cancel Simulated Payment ❌
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Checkout;
