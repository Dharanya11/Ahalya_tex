import Review from '../models/Review.js';

const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  // Simple RFC-like check (basic)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

// @desc    Get all reviews (latest first)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
      : 0;

    res.json({
      count: reviews.length,
      averageRating: Number(avg.toFixed(2)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Review message is required' });
    }

    const review = new Review({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      rating: numericRating,
      message: String(message).trim(),
    });

    const created = await review.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Admin (optional)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.deleteOne({ _id: review._id });
    return res.json({ message: 'Review deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { getReviews, createReview, deleteReview };
