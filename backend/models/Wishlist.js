import mongoose from 'mongoose';

const wishlistItemSchema = mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    customizable: { type: Boolean, default: false },
    customization: { type: mongoose.Schema.Types.Mixed },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const wishlistSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
