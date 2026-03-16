import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { calculateCustomizedUnitPrice } from '../utils/pricing';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const loadLocalCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  };

  const saveLocalCart = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
  });

  // Hydrate cart:
  // - If logged in: prefer DB cart; if DB empty and local has items -> push local to DB
  // - If guest: use localStorage
  useEffect(() => {
    const hydrate = async () => {
      try {
        if (!user?.token) {
          const localItems = loadLocalCart();
          setCartItems(localItems);
          setHydrated(true);
          return;
        }

        const localItems = loadLocalCart();
        const res = await fetch('/api/cart', { headers: authHeaders() });
        const data = await res.json().catch(() => ({ items: [] }));
        const dbItems = Array.isArray(data?.items) ? data.items : [];
        const normalizedDb = dbItems.map((i) => ({
          id: i.itemKey,
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
          category: i.category,
          customizable: i.customizable,
          customization: i.customization || {},
        }));

        if (normalizedDb.length === 0 && localItems.length > 0) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              items: localItems.map((i) => ({
                itemKey: i.id,
                productId: i.productId,
                name: i.name,
                price: i.price,
                image: i.image,
                quantity: i.quantity,
                category: i.category,
                customizable: i.customizable,
                customization: i.customization,
              })),
            }),
          });
          setCartItems(localItems);
        } else {
          setCartItems(normalizedDb);
        }

        localStorage.removeItem('cart');
        setHydrated(true);
      } catch (error) {
        console.error('Error hydrating cart:', error);
        const localItems = loadLocalCart();
        setCartItems(localItems);
        setHydrated(true);
      }
    };

    hydrate();
  }, [user?.token]);

  // Persist cart changes:
  // - guest: localStorage
  // - logged in: MongoDB via /api/cart
  useEffect(() => {
    if (!hydrated) return;

    if (!user?.token) {
      saveLocalCart(cartItems);
      return;
    }

    const persist = async () => {
      try {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            items: cartItems.map((i) => ({
              itemKey: i.id,
              productId: i.productId,
              name: i.name,
              price: i.price,
              image: i.image,
              quantity: i.quantity,
              category: i.category,
              customizable: i.customizable,
              customization: i.customization,
            })),
          }),
        });
      } catch (error) {
        console.error('Error saving cart to server:', error);
      }
    };

    persist();
  }, [cartItems, hydrated, user?.token]);

  const addToCart = (product, customization = {}, quantity = 1) => {
    // Create unique ID based on product and customization
    const customId = product.customizable 
      ? `${product.id}-${customization.size || ''}-${customization.color || ''}-${customization.material || customization.pattern || ''}`
      : `${product.id}-${customization.size || product.size || ''}-${customization.color || product.color || ''}`;
    
    const computedUnitPrice = calculateCustomizedUnitPrice(product, customization);

    const cartItem = {
      id: customId,
      productId: product.id,
      name: product.name,
      price: computedUnitPrice,
      image: product.image,
      quantity: quantity,
      category: product.category || 'general',
      customizable: product.customizable || false,
      // Store all customization details
      customization: {
        size: customization.size || product.size || 'Medium',
        color: customization.color || product.color || 'Default',
        material: customization.material || product.material || null,
        pattern: customization.pattern || null,
        threadCount: customization.threadCount || null,
        // For bags
        fabricType: customization.fabricType || null,
        customText: customization.customText || null,
        imageUpload: customization.imagePreview || null
      }
    };

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === cartItem.id
      );

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, cartItem];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    if (user?.token) {
      fetch('/api/cart', { method: 'DELETE', headers: authHeaders() }).catch(() => {});
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
