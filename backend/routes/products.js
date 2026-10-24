const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const NHG = require('../models/NHG');
const { protect } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  const { category, nhgId } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (nhgId) filter.nhg = nhgId;

  try {
    const products = await Product.find(filter)
      .populate('nhg', 'name code location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('nhg', 'name code location');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Add a product
// @route   POST /api/products
// @access  Private (Admin or approved Member)
router.post('/', protect, async (req, res) => {
  const { name, description, price, image, category, stock, nhgId } = req.body;

  const cleanName = (name || '').trim();
  const cleanDescription = (description || '').trim();
  const numPrice = Number(price);
  const numStock = stock !== undefined ? Number(stock) : 10;

  if (!cleanName || !cleanDescription || !price || !category) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  if (cleanName.length < 2) {
    return res.status(400).json({ success: false, message: 'Product name must be at least 2 characters long' });
  }

  if (cleanDescription.length < 5) {
    return res.status(400).json({ success: false, message: 'Product description must be at least 5 characters long' });
  }

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ success: false, message: 'Price must be a valid number greater than ₹0' });
  }

  if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
    return res.status(400).json({ success: false, message: 'Stock must be a non-negative whole number' });
  }

  try {
    let productNhgId = null;

    if (req.user.role === 'admin') {
      if (!nhgId) {
        return res.status(400).json({ success: false, message: 'Admin must specify an nhgId' });
      }
      productNhgId = nhgId;
    } else {
      if (!req.user.nhg) {
        return res.status(400).json({ success: false, message: 'You must belong to an NHG to add products' });
      }
      productNhgId = req.user.nhg;
    }

    const product = await Product.create({
      name: cleanName,
      description: cleanDescription,
      price: numPrice,
      image: image ? image.trim() : undefined,
      category,
      stock: numStock,
      nhg: productNhgId,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin or NHG Leaders/Owners)
router.put('/:id', protect, async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Auth check
    const nhg = await NHG.findById(product.nhg);
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    if (name !== undefined) {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        return res.status(400).json({ success: false, message: 'Product name must be at least 2 characters long' });
      }
      product.name = cleanName;
    }

    if (description !== undefined) {
      const cleanDesc = description.trim();
      if (cleanDesc.length < 5) {
        return res.status(400).json({ success: false, message: 'Product description must be at least 5 characters long' });
      }
      product.description = cleanDesc;
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid number greater than ₹0' });
      }
      product.price = numPrice;
    }

    if (image !== undefined) {
      product.image = image ? image.trim() : product.image;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        return res.status(400).json({ success: false, message: 'Stock must be a non-negative whole number' });
      }
      product.stock = numStock;
    }

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin or NHG Leaders/Owners)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Auth check
    const nhg = await NHG.findById(product.nhg);
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
