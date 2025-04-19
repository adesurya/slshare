const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product-brand-models');
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');

// Get products page - accessible to all users
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll(12, 0);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.render('products/index', {
      title: 'Semua Produk - MOVA',
      products,
      currentPage: 'home',
      showSearchBar: true
    });
  } catch (error) {
    console.error('Products page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load products page',
      currentPage: ''
    });
  }
});

// Get product details - accessible to all users
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).render('error', {
        title: 'Product Not Found',
        message: 'The product you requested could not be found',
        currentPage: ''
      });
    }
    
    // Calculate cashback
    product.cashback = await Product.calculateCashback(product.id);
    
    // Get related products
    const relatedProducts = await Product.getRelatedProducts(product.id, 4);
    
    // Calculate cashback for related products
    for (let relatedProduct of relatedProducts) {
      relatedProduct.cashback = await Product.calculateCashback(relatedProduct.id);
    }
    
    // Check if product is in user's wishlist
    let isInWishlist = false;
    if (res.locals.isAuthenticated && req.user) {
      isInWishlist = await User.isInWishlist(req.user.id, product.id);
    }
    
    res.render('products/detail', {
      title: `${product.name} - MOVA`,
      product,
      relatedProducts,
      isInWishlist,
      currentPage: 'home',
      showSearchBar: false,
      requiresAuth: !res.locals.isAuthenticated
    });
  } catch (error) {
    console.error('Product detail page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load product details',
      currentPage: ''
    });
  }
});

// Add product to wishlist - requires authentication
router.post('/:id/wishlist', isAuthenticated, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Add to wishlist
    await User.addToWishlist(req.user.id, productId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
});

// Remove product from wishlist - requires authentication
router.delete('/:id/wishlist', isAuthenticated, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Remove from wishlist
    await User.removeFromWishlist(req.user.id, productId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
});

// Generate affiliate link - requires authentication
router.post('/:id/affiliate-link', isAuthenticated, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Generate affiliate link
    const affiliateLink = `https://mova.app/go/${productId}?ref=${req.user.id}`;
    
    res.json({ 
      success: true, 
      data: {
        productId,
        productName: product.name,
        affiliateLink
      }
    });
  } catch (error) {
    console.error('Generate affiliate link error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate affiliate link' });
  }
});

// Process product purchase - requires authentication
router.post('/:id/purchase', isAuthenticated, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Calculate cashback
    const cashback = await Product.calculateCashback(productId);
    
    // In a real implementation, this would:
    // 1. Create a transaction record
    // 2. Forward to the e-commerce platform
    // 3. Track the purchase for conversion
    
    // For this example, we'll just return as if the purchase was initiated
    res.json({ 
      success: true, 
      data: {
        productId,
        productName: product.name,
        cashback,
        message: 'Purchase initiated successfully'
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, message: 'Failed to process purchase' });
  }
});

// Load more products - accessible to all users
router.get('/load-more/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 12;
    const offset = page * limit;
    
    const products = await Product.findAll(limit, offset);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.json({ 
      success: true, 
      data: products,
      hasMore: products.length === limit
    });
  } catch (error) {
    console.error('Load more products error:', error);
    res.status(500).json({ success: false, message: 'Failed to load more products' });
  }
});

// Filter products by category - accessible to all users
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.render('products/category', {
      title: `${category} Products - MOVA`,
      category,
      products,
      currentPage: 'home',
      showSearchBar: true
    });
  } catch (error) {
    console.error('Category filter error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load category products',
      currentPage: ''
    });
  }
});

module.exports = router;