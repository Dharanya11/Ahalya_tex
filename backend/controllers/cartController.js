import Cart from '../models/Cart.js';

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.json({ items: [] });
  }
  return res.json({ items: cart.items || [] });
};

// @desc    Replace logged-in user's cart items
// @route   PUT /api/cart
// @access  Private
const putCart = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' });
  }

  const sanitized = items.map((i) => ({
    itemKey: String(i.itemKey || i.id || ''),
    product: i.product || undefined,
    productId: i.productId ? i.productId : undefined,
    name: i.name || 'Item',
    price: typeof i.price === 'number' ? i.price : Number(i.price || 0),
    image: i.image,
    quantity: typeof i.quantity === 'number' ? i.quantity : Number(i.quantity || 1),
    category: i.category,
    customizable: !!i.customizable,
    customization: i.customization || {},
  })).filter((i) => i.itemKey);

  const updated = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: sanitized } },
    { new: true, upsert: true }
  );

  return res.json({ items: updated.items || [] });
};

// @desc    Clear logged-in user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true, upsert: true }
  );
  return res.json({ message: 'Cart cleared' });
};

export { getCart, putCart, clearCart };
