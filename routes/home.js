const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');
const { setCurrentUser } = require('../middlewares/auth');

// Home page - accessible to all users
router.get('/', async (req, res) => {
  try {
    // Get featured products - using a try-catch for safety
    let featuredProducts = [];
    try {
      featuredProducts = await Product.findAll(6, 0);
      
      // Calculate cashback for each product
      for (let product of featuredProducts) {
        product.cashback = await Product.calculateCashback(product.id);
      }
    } catch (productError) {
      console.error('Error fetching products:', productError);
      // Continue with empty products array
    }
    
    res.render('home', {
      title: 'MOVA - Belanja Sambil Cuan',
      featuredProducts: featuredProducts || [],
      currentPage: 'home',
      showSearchBar: true,
      showAppPrompt: res.locals.showAppDownloadPrompt,
      appStoreUrl: process.env.IOS_APP_URL || '#',
      playStoreUrl: process.env.ANDROID_APP_URL || '#'
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load home page',
      currentPage: ''
    });
  }
});

// Set cookie to hide app download prompt
router.post('/hide-app-prompt', (req, res) => {
  res.cookie('hideAppPrompt', 'true', { maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
  res.status(200).json({ success: true });
});

// Search results page - accessible to all users
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    
    // If no search term, redirect to home
    if (!searchTerm.trim()) {
      return res.redirect('/');
    }
    
    // Save search to history if user is logged in
    if (res.locals.isAuthenticated && req.user) {
      // This would be handled by a model method
      // await SearchHistory.saveSearch(req.user.id, searchTerm);
    }
    
    // Search products
    let products = [];
    try {
      products = await Product.search(searchTerm);
      
      // Calculate cashback for each product
      for (let product of products) {
        product.cashback = await Product.calculateCashback(product.id);
      }
    } catch (searchError) {
      console.error('Error searching products:', searchError);
      // Continue with empty products array
    }
    
    res.render('search', {
      title: `Search Results for "${searchTerm}" - MOVA`,
      searchTerm,
      products: products || [],
      currentPage: 'home',
      showSearchBar: true
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to perform search',
      currentPage: ''
    });
  }
});

// Process shopping links - requires login
router.post('/process-link', async (req, res) => {
  try {
    // Check if user is logged in
    if (!res.locals.isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        redirectTo: '/auth/login?redirect=' + encodeURIComponent(req.headers.referer || '/')
      });
    }
    
    const { link } = req.body;
    
    if (!link) {
      return res.status(400).json({ success: false, message: 'Link is required' });
    }
    
    // Process the link (this would contain your actual link processing logic)
    const processedLink = {
      original: link,
      affiliate: `https://mova.app/go?url=${encodeURIComponent(link)}&uid=${req.user.id}`,
      title: 'Sample Product',
      image: '/images/product-placeholder.jpg',
      price: 199000,
      cashback: 19900
    };
    
    res.json({
      success: true,
      data: processedLink
    });
  } catch (error) {
    console.error('Link processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process link' });
  }
});

module.exports = router;