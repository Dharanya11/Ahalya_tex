import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const isAuthenticated = !!user;

  const mapServerItemsToLocal = async (items) => {
    // Server stores only productId + addedAt; local UI expects product objects.
    // We try to resolve product objects from the local product catalog.
    try {
      const mod = await import('../data/products');
      const getProductById = mod?.getProductById;
      if (typeof getProductById !== 'function') {
        return (items || []).map((x) => ({ id: String(x.productId), addedAt: x.addedAt }));
      }
      return (items || []).map((x) => {
        const product = getProductById(String(x.productId));
        return product ? { ...product, addedAt: x.addedAt } : { id: String(x.productId), addedAt: x.addedAt };
      });
    } catch {
      return (items || []).map((x) => ({ id: String(x.productId), addedAt: x.addedAt }));
    }
  };

  const mapLocalToServerItems = (list) => {
    return (list || [])
      .map((p) => ({
        productId: p?.id,
        addedAt: p?.addedAt || new Date().toISOString(),
      }))
      .filter((x) => x.productId !== undefined && x.productId !== null && String(x.productId).length > 0);
  };

  // Load wishlist:
  // - Guest: localStorage
  // - Auth: MongoDB via API
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (!isAuthenticated) {
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              const parsed = JSON.parse(savedWishlist);
              if (isMounted) setWishlist(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
              console.error('Error loading wishlist from localStorage:', error);
              localStorage.removeItem('wishlist');
              if (isMounted) setWishlist([]);
            }
          } else if (isMounted) {
            setWishlist([]);
          }
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/wishlist`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json().catch(() => ({ items: [] }));
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load wishlist');
        }

        const hydrated = await mapServerItemsToLocal(data?.items || []);
        if (isMounted) setWishlist(hydrated);
      } catch (e) {
        console.error('Wishlist load error:', e);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.token]);

  // Persist wishlist changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      return;
    }

    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/wishlist`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ items: mapLocalToServerItems(wishlist) }),
      signal: controller.signal,
    }).catch(() => {});

    return () => controller.abort();
  }, [wishlist, isAuthenticated, user?.token]);

  const addToWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev; // Already in wishlist
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (isAuthenticated) {
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/wishlist`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }).catch(() => {});
    }
  };

  const value = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length
  }), [wishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
