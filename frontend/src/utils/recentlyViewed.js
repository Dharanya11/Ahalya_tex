// Recently viewed products utility

const MAX_RECENT_ITEMS = 10;
const STORAGE_KEY = 'recentlyViewed';

export const addToRecentlyViewed = (product) => {
  const recent = getRecentlyViewed();
  // Remove if already exists
  const filtered = recent.filter(item => item.id !== product.id);
  // Add to beginning
  const updated = [{ ...product, viewedAt: new Date().toISOString() }, ...filtered];
  // Keep only max items
  const limited = updated.slice(0, MAX_RECENT_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
};

export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored === '') {
      return [];
    }
    // Check if stored data is valid JSON
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading recently viewed:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const removeFromRecentlyViewed = (productId) => {
  try {
    const recent = getRecentlyViewed();
    const updated = recent.filter(item => item.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    return getRecentlyViewed();
  }
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(STORAGE_KEY);
};
