import { createContext, useState, useEffect, useContext } from 'react';
import productsData from '../data/products';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Load cart from localStorage
  useEffect(() => {
    const key = user ? `cart_${user.email}` : 'cart_guest';
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart
  const saveCart = (items) => {
    setCartItems(items);
    const key = user ? `cart_${user.email}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify(items));
  };

  const addToCart = (productId, quantity = 1, variant = '') => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    let updated = [...cartItems];
    const existingIndex = updated.findIndex(item => item.product.id === productId && item.variant === variant);

    if (existingIndex > -1) {
      // Check stock limits
      const newQty = updated[existingIndex].quantity + quantity;
      if (newQty <= product.stock) {
        updated[existingIndex].quantity = newQty;
      } else {
        updated[existingIndex].quantity = product.stock;
        alert(`Only ${product.stock} items left in stock.`);
      }
    } else {
      // Limit to stock
      const finalQty = quantity <= product.stock ? quantity : product.stock;
      updated.push({
        product,
        quantity: finalQty,
        variant: variant || (product.variants && product.variants[0]) || ''
      });
    }
    saveCart(updated);
  };

  const updateQuantity = (productId, quantity, variant = '') => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    let updated = cartItems.map(item => {
      if (item.product.id === productId && item.variant === variant) {
        const finalQty = Math.max(1, Math.min(quantity, product.stock));
        return { ...item, quantity: finalQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeFromCart = (productId, variant = '') => {
    const updated = cartItems.filter(item => !(item.product.id === productId && item.variant === variant));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart, 
      getCartTotal, 
      getCartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

