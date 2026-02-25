const Order = require('../models/Order');

// Helper to map frontend status to backend enum
const mapStatusToDb = (frontendStatus) => {
  const map = {
    "Order Received": "received",
    "Preparing": "preparing",
    "Out for Delivery": "out_for_delivery",
    "Delivered": "delivered"
  };
  return map[frontendStatus] || frontendStatus; // fallback in case already correct
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryDetails, paymentMethod } = req.body;

    const orderData = {
      user: req.user._id,
      items: items.map(item => ({
        menuItemId: item.menuItem,
        quantity: item.quantity
      })),
      customerName: deliveryDetails.name,
      address: deliveryDetails.address,
      phone: deliveryDetails.phone,
      paymentMethod: paymentMethod || 'cash'
    };

    const order = await Order.create(orderData);
    const populatedOrder = await Order.findById(order._id).populate('items.menuItemId');

    const io = req.app.get('io');
    io.emit('new_order', populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItemId');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const dbStatus = mapStatusToDb(status); // ← mapping added here

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: dbStatus },
      { new: true, runValidators: true }
    ).populate('items.menuItemId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const io = req.app.get('io');
    io.emit('order_status_updated', { orderId: order._id, status: order.status });

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort('-createdAt').populate('items.menuItemId');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.menuItemId');
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};