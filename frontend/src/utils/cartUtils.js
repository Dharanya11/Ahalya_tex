// Cart utility functions for e-commerce project

export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    console.log('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

export const getCartItems = () => {
  try {
    const cartItems = localStorage.getItem('cart');
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const addToCart = (product, quantity = 1) => {
  try {
    const cartItems = getCartItems();
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        ...product,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return [];
  }
};

export const removeFromCart = (productId) => {
  try {
    const cartItems = getCartItems();
    const updatedCart = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return [];
  }
};

export const updateCartItemQuantity = (productId, quantity) => {
  try {
    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cartItems.splice(itemIndex, 1);
      } else {
        cartItems[itemIndex].quantity = quantity;
      }
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    return cartItems;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return [];
  }
};

export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

export const getCartTotal = () => {
  try {
    const cartItems = getCartItems();
    return calculateCartTotal(cartItems);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
};

export const getCartItemCount = () => {
  try {
    const cartItems = getCartItems();
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart item count:', error);
    return 0;
  }
};
