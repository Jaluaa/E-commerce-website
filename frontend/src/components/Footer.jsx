import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

// Glowing Magical SVG FandomRealm Logo Icon
const LogoIcon = ({ className = "w-7 h-7" }) => (
  <svg className={`${className} filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:rotate-12 transition-transform duration-500`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footer-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" stopColor-opacity="1" />
        <stop offset="50%" stopColor="#8b5cf6" stopColor-opacity="1" />
        <stop offset="100%" stopColor="#d946ef" stopColor-opacity="1" />
      </linearGradient>
      <filter id="footer-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer magic dash ring */}
    <circle cx="12" cy="12" r="9.5" stroke="url(#footer-logo-grad)" strokeWidth="1.5" strokeDasharray="3 2" filter="url(#footer-logo-glow)" />
    {/* Outer solid thin ring */}
    <circle cx="12" cy="12" r="7.5" stroke="url(#footer-logo-grad)" strokeWidth="0.5" strokeOpacity="0.5" />
    {/* Wizard hat / star crown crest */}
    <path d="M12 4.5L7 13.5H17L12 4.5Z" fill="url(#footer-logo-grad)" fillOpacity="0.15" stroke="url(#footer-logo-grad)" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Inner magical diamond star */}
    <path d="M12 7.5L13 9.8L15.3 10.8L13 11.8L12 14.1L11 11.8L8.7 10.8L11 9.8L12 7.5Z" fill="url(#footer-logo-grad)" filter="url(#footer-logo-glow)" />
  </svg>
);

// Custom Glowing SVG Instagram Icon
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Custom Glowing SVG Twitter/X Icon
const TwitterIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom Glowing SVG YouTube Icon
const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

// Custom Glowing SVG GitHub Icon
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast("Please enter a valid email address! ✉️", "error");
      return;
    }
    showToast("Welcome to the dispatch! Owls are on their way! 🦉", "success");
    setEmail('');
  };

  return (
    <footer className="relative py-16 mt-20 border-t border-white/5 bg-slate-950/45 backdrop-blur-xl overflow-hidden animate-fade-in-up">
      {/* Immersive Background Ambient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none select-none animate-magical-glow" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none select-none animate-magical-glow delay-300" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <LogoIcon />
              <span className="text-xl font-black bg-gradient-to-r from-brand-primary via-brand-accent to-fuchsia-400 bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                FANDOMREALM
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 pr-4">
              The premier gateway for high-fidelity replicas, apparel, and merchandise from iconic cinematic, literary, and pop-culture universes. Explore your fandom, embrace the realm.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 bg-slate-900/60 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 hover:shadow-[0_0_10px_rgba(244,114,182,0.25)] transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <InstagramIcon />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 bg-slate-900/60 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <TwitterIcon />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 bg-slate-900/60 text-slate-400 hover:text-red-450 hover:border-red-500/30 hover:shadow-[0_0_10px_rgba(248,113,113,0.25)] transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <YoutubeIcon />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 bg-slate-900/60 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 hover:shadow-[0_0_10px_rgba(167,139,250,0.25)] transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <GithubIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Fandom Universes */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Shop Universes</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/products?fandom=Harry%20Potter" className="hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 group select-none">
                  <span className="group-hover:rotate-12 transition-transform duration-300">⚡</span> Harry Potter Realm
                </Link>
              </li>
              <li>
                <Link to="/products?fandom=Friends" className="hover:text-emerald-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 group select-none">
                  <span className="group-hover:rotate-12 transition-transform duration-300">☕</span> Friends Central Perk
                </Link>
              </li>
              <li>
                <Link to="/products?fandom=K-pop" className="hover:text-pink-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 group select-none">
                  <span className="group-hover:rotate-12 transition-transform duration-300">🎤</span> K-pop Stadium
                </Link>
              </li>
              <li>
                <Link to="/products?fandom=K-drama" className="hover:text-cyan-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 group select-none">
                  <span className="group-hover:rotate-12 transition-transform duration-300">🎬</span> K-drama Memories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Realm Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Realm Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/products" className="hover:text-brand-primary hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 select-none">
                  <span>🛍️</span> All Merchandise
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-primary hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 select-none">
                  <span>🛒</span> Shopping Basket
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-primary hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 select-none">
                  <span>❤️</span> Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-primary hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-1.5 select-none">
                  <span>📦</span> Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Owl Dispatch */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Owl Dispatch</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Subscribe to the owl dispatch for limited-edition drops, replica releases, and magical realm promotions!
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full pt-1">
              <input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-xl text-xs bg-slate-950/60 border border-white/8 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 placeholder-slate-500 duration-300"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:brightness-110 text-white font-bold text-xs shadow-lg active:scale-95 duration-300 transition-all cursor-pointer shimmer-btn"
              >
                Send 🦉
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Horizontal Separator */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} FANDOMREALM. Crafted for true collectors & enthusiasts.
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-350 transition-colors select-none">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-350 transition-colors select-none">Terms of Service</a>
            <a href="#realm-rules" className="hover:text-slate-350 transition-colors select-none">Realm Rules</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
