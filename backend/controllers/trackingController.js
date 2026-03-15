import Order from '../models/Order.js';

const isValidTrackingNumber = (value) => {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  // Allow alphanumerics plus dashes, 6-40 chars
  return /^[A-Z0-9-]{6,40}$/i.test(v);
};

// @desc    Track order by tracking number
// @route   GET /api/tracking/:trackingNumber
// @access  Public
const trackByNumber = async (req, res) => {
  try {
    const trackingNumber = String(req.params.trackingNumber || '').trim();
    if (!isValidTrackingNumber(trackingNumber)) {
      return res.status(400).json({ message: 'Invalid tracking number format' });
    }

    const order = await Order.findOne({ 'shippingTracking.trackingNumber': trackingNumber })
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }

    const st = order.shippingTracking || {};

    return res.json({
      trackingNumber,
      orderId: order._id,
      user: order.user,
      orderStatus: order.orderStatus,
      estimatedDelivery: st.estimatedDelivery,
      lastLocation: st.lastLocation,
      lastUpdatedAt: st.lastUpdatedAt,
      origin: st.origin,
      destination: st.destination,
      agent: st.agent,
      shippingAddress: order.shippingAddress,
      statusHistory: order.statusHistory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch tracking info' });
  }
};

// @desc    Update delivery agent live location for tracking number
// @route   PUT /api/tracking/:trackingNumber/location
// @access  Admin
const updateTrackingLocation = async (req, res) => {
  try {
    const trackingNumber = String(req.params.trackingNumber || '').trim();
    if (!isValidTrackingNumber(trackingNumber)) {
      return res.status(400).json({ message: 'Invalid tracking number format' });
    }

    const { lat, lng, lastLocation, estimatedDelivery, origin, destination } = req.body || {};

    const order = await Order.findOne({ 'shippingTracking.trackingNumber': trackingNumber });
    if (!order) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }

    order.shippingTracking = order.shippingTracking || {};
    order.shippingTracking.agent = order.shippingTracking.agent || {};

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    order.shippingTracking.agent.lat = numLat;
    order.shippingTracking.agent.lng = numLng;
    order.shippingTracking.agent.updatedAt = new Date();

    if (typeof lastLocation === 'string' && lastLocation.trim()) {
      order.shippingTracking.lastLocation = lastLocation.trim();
    }

    if (estimatedDelivery) {
      const dt = new Date(estimatedDelivery);
      if (!Number.isNaN(dt.getTime())) {
        order.shippingTracking.estimatedDelivery = dt;
      }
    }

    if (origin && typeof origin === 'object') {
      order.shippingTracking.origin = {
        ...(order.shippingTracking.origin || {}),
        ...origin,
      };
    }

    if (destination && typeof destination === 'object') {
      order.shippingTracking.destination = {
        ...(order.shippingTracking.destination || {}),
        ...destination,
      };
    }

    order.shippingTracking.lastUpdatedAt = new Date();

    const updated = await order.save();
    return res.json({
      message: 'Location updated',
      trackingNumber,
      shippingTracking: updated.shippingTracking,
      orderStatus: updated.orderStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update location' });
  }
};

export { trackByNumber, updateTrackingLocation };
