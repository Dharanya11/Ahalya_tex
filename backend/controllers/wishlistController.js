import Wishlist from '../models/Wishlist.js';

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res.json({ items: [] });
  }
  return res.json({ items: wishlist.items || [] });
};

// @desc    Replace logged-in user's wishlist items
// @route   PUT /api/wishlist
// @access  Private
const putWishlist = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' });
  }

  const sanitized = items
    .map((i) => ({
      productId: i.productId ?? i.product ?? i.id,
      addedAt: i.addedAt ? new Date(i.addedAt) : new Date(),
    }))
    .filter((i) => i.productId !== undefined && i.productId !== null && String(i.productId).length > 0);

  const updated = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: sanitized } },
    { new: true, upsert: true }
  );

  return res.json({ items: updated.items || [] });
};

// @desc    Clear logged-in user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true, upsert: true }
  );
  return res.json({ message: 'Wishlist cleared' });
};

export { getWishlist, putWishlist, clearWishlist };
