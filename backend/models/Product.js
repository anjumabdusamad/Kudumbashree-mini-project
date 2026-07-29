const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', // Default fresh produce / grocery placeholder
  },
  nhg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NHG',
    required: [true, 'Product must belong to a Kudumbashree NHG unit'],
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    enum: ['Food & Spices', 'Handicrafts', 'Soaps & Cosmetics', 'Agriculture', 'Apparel & Handloom', 'Others'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add product stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 10,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
