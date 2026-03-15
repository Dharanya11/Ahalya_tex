import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema(
  {
    itemKey: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    image: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    category: { type: String },
    customizable: { type: Boolean, default: false },
    customization: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const cartSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
