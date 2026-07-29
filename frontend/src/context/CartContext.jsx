import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('kudumba_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart state:', err);
      }
    }
  }, []);

  // Sync cart to localStorage
  const syncCart = (items) => {
    setCartItems(items);
    localStorage.setItem('kudumba_cart', JSON.stringify(items));
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        throw new Error(`Cannot add more. Only ${product.stock} units available in stock.`);
      }
      const updated = cartItems.map((item) =>
        item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
      syncCart(updated);
    } else {
      if (product.stock < 1) {
        throw new Error('This product is out of stock.');
      }
      syncCart([...cartItems, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQty, maxStock) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (newQty > maxStock) {
      throw new Error(`Only ${maxStock} units available in stock.`);
    }
    const updated = cartItems.map((item) =>
      item.product._id === productId ? { ...item, quantity: Number(newQty) } : item
    );
    syncCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.product._id !== productId);
    syncCart(updated);
  };

  const clearCart = () => {
    syncCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
