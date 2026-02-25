const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['paytm', 'gpay', 'phonepe', 'cash'], // updated with all options
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['received', 'preparing', 'out_for_delivery', 'delivered'],
    default: 'received'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);