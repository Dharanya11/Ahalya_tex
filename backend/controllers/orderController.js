import Order from '../models/Order.js';

const ALLOWED_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const ALLOWED_PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'qr_upi'];

const generateTrackingNumber = () => {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WS-${Date.now()}-${rnd}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.productId || x._id,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      shippingTracking: {
        carrier: 'Windsurf Logistics',
        trackingNumber: generateTrackingNumber(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        lastLocation: shippingAddress?.city || 'Warehouse',
        lastUpdatedAt: new Date(),
        origin: {
          label: 'Windsurf Warehouse',
        },
        destination: {
          label: `${shippingAddress?.city || 'Destination'}`,
        },
        agent: {
          updatedAt: new Date(),
        },
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'Placed',
      statusHistory: [{ status: 'Placed', date: Date.now(), note: 'Order placed' }],
    });

    const createdOrder = await order.save();
    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get order by ID (user can only access own order; admin can access any)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email role');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin;
    const isOwner = String(order.user?._id || order.user) === String(req.user?._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch order' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const { status, note, shippingTracking } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (order.orderStatus !== status) {
    order.orderStatus = status;
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({ status, date: Date.now(), note });
  }

  if (shippingTracking && typeof shippingTracking === 'object') {
    order.shippingTracking = order.shippingTracking || {};
    if (typeof shippingTracking.carrier === 'string') order.shippingTracking.carrier = shippingTracking.carrier;
    if (typeof shippingTracking.trackingNumber === 'string') order.shippingTracking.trackingNumber = shippingTracking.trackingNumber;
    if (shippingTracking.estimatedDelivery) order.shippingTracking.estimatedDelivery = shippingTracking.estimatedDelivery;
    if (typeof shippingTracking.lastLocation === 'string') order.shippingTracking.lastLocation = shippingTracking.lastLocation;
    order.shippingTracking.lastUpdatedAt = Date.now();
  }

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.cancelledAt = undefined;
  }
  if (status === 'Cancelled') {
    order.cancelledAt = Date.now();
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }
  const updated = await order.save();
  res.json(updated);
};

// @desc    Confirm order payment (e.g. QR / manual confirmation)
// @route   POST /api/orders/:id/payment-confirm
// @access  Private (order owner or admin)
const confirmOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paymentMethod,
      paymentStatus,
      paymentId,
      transactionId,
      amount,
      timestamp,
    } = req.body || {};

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin;
    const isOwner = String(order.user) === String(req.user?._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only update your own orders.' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already marked as paid' });
    }

    // Mark order as paid
    order.isPaid = true;
    order.paidAt = timestamp ? new Date(timestamp) : Date.now();
    order.paymentResult = {
      id: paymentId || transactionId || order.paymentResult?.id,
      status: paymentStatus || 'Payment Successful',
      transactionId: transactionId || order.paymentResult?.transactionId,
      amount: typeof amount === 'number' ? amount : order.totalPrice,
      method: paymentMethod || order.paymentMethod,
      update_time: Date.now(),
      email_address: req.user?.email || order.paymentResult?.email_address,
    };

    if (order.orderStatus === 'Placed') {
      order.orderStatus = 'Confirmed';
      order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
      order.statusHistory.push({ status: 'Confirmed', date: Date.now(), note: 'Payment confirmed (manual/QR)' });
    }

    const updatedOrder = await order.save();

    return res.json({
      message: 'Order payment confirmed successfully',
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to confirm order payment' });
  }
};

export { addOrderItems, getMyOrders, getOrderById, getOrders, updateOrderStatus, confirmOrderPayment };
