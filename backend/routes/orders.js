const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
router.post('/', async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body; // items: [{ productId, quantity }]

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ success: false, message: 'Please provide items and shipping address' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let totalAmount = 0;
    const orderItems = [];
    const productsToUpdate = [];

    // 1. Check stocks and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // 2. Validate wallet balance if paying with wallet
    let isPaid = false;
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. You have ₹${user.walletBalance} but order total is ₹${totalAmount}.`,
        });
      }
      user.walletBalance -= totalAmount;
      await user.save();
      isPaid = true;
    }

    // 3. Decrement stock
    for (const item of productsToUpdate) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    // 4. Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      isPaid,
      status: 'pending',
    });

    // Notify user
    await Notification.create({
      recipient: req.user.id,
      title: 'Order Placed Successfully',
      message: `Your order for ₹${totalAmount} has been placed. Order ID: ${order._id}. Payment: ${paymentMethod === 'wallet' ? 'Wallet Paid' : 'Cash on Delivery'}`,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price image')
      .sort({ orderDate: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
router.get('/all', authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price image nhg')
      .sort({ orderDate: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin or supplying NHG Leaders)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restore stock if cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();

    // Send notification to buyer
    await Notification.create({
      recipient: order.user,
      title: `Order Status: ${status.toUpperCase()}`,
      message: `Your order (ID: ${order._id}) has been ${status}.`,
    });

    res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
