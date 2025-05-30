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
      // Initialize Product model jika belum tersedia
      const Product = require('../models/Product-brand-models').Product;
      
      // Fetch products dengan sorting created_at DESC
      featuredProducts = await Product.findAll(10, 0, 'created_at', 'DESC');
      
      // Calculate cashback for each product and ensure proper structure
      for (let product of featuredProducts) {
        // Default cashback structure if calculation fails
        let defaultCashback = {
          percentage: 0,
          amount: 0
        };
        
        try {
          // Try to calculate cashback
          product.cashback = await Product.calculateCashback(product.id);
          
          // Ensure cashback has proper structure
          if (!product.cashback) {
            product.cashback = defaultCashback;
          } else if (typeof product.cashback === 'number') {
            // If cashback is just a number, format it properly
            product.cashback = {
              percentage: Math.round((product.cashback / product.price) * 100),
              amount: product.cashback
            };
          } else if (!product.cashback.amount) {
            // Ensure amount property exists
            product.cashback.amount = 0;
          }
        } catch (cashbackError) {
          console.error('Error calculating cashback for product', product.id, cashbackError);
          product.cashback = defaultCashback;
        }
        
        // Ensure price is a number
        if (typeof product.price !== 'number') {
          product.price = parseFloat(product.price) || 0;
        }
      }
    } catch (productError) {
      console.error('Error fetching products:', productError);
      // Continue with empty products array
    }
    
    res.render('home', {
      title: 'MOVA - Belanja Sambil Cuan',
      featuredProducts: featuredProducts || [], // Pastikan ini dikirim ke template
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

router.get('/api/products', async (req, res) => {
  try {
    // Get pagination parameters from query string
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get sort parameters
    const sortField = req.query.sortField || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    // Get filter parameters
    const category = req.query.category || '';
    
    // Fetch products with pagination, sorting, and filtering
    let products = [];
    try {
      if (category) {
        // If category filter is provided, use category-specific method
        products = await Product.findByCategory(category, limit, offset, sortField, sortOrder);
      } else {
        // Otherwise use general findAll method
        products = await Product.findAll(limit, offset, sortField, sortOrder);
      }
      
      // Calculate cashback for each product
      for (let product of products) {
        product.cashback = await Product.calculateCashback(product.id);
      }
    } catch (productError) {
      console.error('Error fetching products:', productError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch products' 
      });
    }
    
    // Return products as JSON
    res.json({
      success: true,
      data: {
        products,
        hasMore: products.length === limit // If we got the requested number of products, there may be more
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
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