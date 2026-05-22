import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      console.log('🔍 Fetched wishlist items:', res.data);
      setWishlistItems(res.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch wishlist", error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) return alert('Please login first');
    console.log('➕ Adding product to wishlist. Product ID:', productId);
    try {
      const res = await api.post('/wishlist', { productId });
      console.log('✅ Add to wishlist response:', res.data);
      fetchWishlist();
    } catch (error) {
      console.error("❌ Failed to add to wishlist", error);
      alert("Failed to add to wishlist: " + (error.response?.data?.error || error.message));
    }
  };

  const removeFromWishlist = async (productId) => {
    console.log('➖ Removing product from wishlist. Product ID:', productId);
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      console.log('✅ Remove from wishlist response:', res.data);
      fetchWishlist();
    } catch (error) {
      console.error("❌ Failed to remove from wishlist", error);
      alert("Failed to remove from wishlist: " + (error.response?.data?.error || error.message));
    }
  };

  const isInWishlist = (productId) => {
    const isPresent = wishlistItems.some(item => item._id === productId || item.id === productId);
    return isPresent;
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
