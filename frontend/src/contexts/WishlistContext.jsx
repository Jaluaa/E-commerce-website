import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import productsData from '../data/products';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useAuth();

  // Load wishlist from localStorage on mount and when user changes
  useEffect(() => {
    const key = user ? `wishlist_${user.email}` : 'wishlist_guest';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored));
      } catch (e) {
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // Save to localStorage whenever wishlistItems changes
  const saveWishlist = (items) => {
    setWishlistItems(items);
    const key = user ? `wishlist_${user.email}` : 'wishlist_guest';
    localStorage.setItem(key, JSON.stringify(items));
  };

  const addToWishlist = (productId) => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    if (wishlistItems.some(item => item.id === productId)) return; // already in wishlist
    
    const updated = [...wishlistItems, product];
    saveWishlist(updated);
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => item.id !== productId);
    saveWishlist(updated);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

