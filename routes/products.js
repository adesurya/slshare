//routes/products.js

const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');

const processCashbackData = (product) => {
  if (!product) return product;
  
  // Default cashback structure
  let defaultCashback = {
    percentage: 0,
    amount: 0
  };
  
  try {
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
    
    // Ensure price is a number
    if (typeof product.price !== 'number') {
      product.price = parseFloat(product.price) || 0;
    }
  } catch (error) {
    console.error('Error processing cashback data:', error);
    product.cashback = defaultCashback;
  }
  
  return product;
};

// PENTING: Pindahkan rute dengan parameter menjadi lebih bawah
// dari rute yang lebih spesifik

// Rute spesifik seperti /load-more dan /category harus didefinisikan SEBELUM rute dengan parameter /:id
// Get load more products
router.get('/load-more/:page', async (req, res) => {
  try {
    console.log("Load more products untuk halaman:", req.params.page);
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
    console.log("Filtering by category:", req.params.category);
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

// Get products page - accessible to all users
router.get('/', async (req, res) => {
  try {
    console.log("Loading all products");
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
// PENTING: Ini harus berada di BAWAH rute spesifik lainnya
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Fetch product details
    let product;
    try {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).render('error', { 
          title: 'Product Not Found',
          message: 'The product you requested could not be found.',
          currentPage: ''
        });
      }
      
      // Calculate cashback
      try {
        product.cashback = await Product.calculateCashback(productId);
      } catch (cashbackError) {
        console.error('Error calculating cashback:', cashbackError);
        product.cashback = {
          percentage: 0,
          amount: 0
        };
      }
      
      // Process cashback data
      product = processCashbackData(product);
      
    } catch (productError) {
      console.error('Error fetching product:', productError);
      return res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load product details.',
        currentPage: ''
      });
    }
    
    // Fetch related products
    let relatedProducts = [];
    try {
      relatedProducts = await Product.findRelated(productId, 5);
      
      // Calculate cashback for related products
      for (let relProduct of relatedProducts) {
        try {
          relProduct.cashback = await Product.calculateCashback(relProduct.id);
          // Process cashback data
          relProduct = processCashbackData(relProduct);
        } catch (relCashbackError) {
          console.error('Error calculating related product cashback:', relCashbackError);
          relProduct.cashback = {
            percentage: 0,
            amount: 0
          };
        }
      }
    } catch (relatedError) {
      console.error('Error fetching related products:', relatedError);
      // Continue with empty related products
    }
    
    res.render('products/detail', {
      title: `${product.name} - MOVA`,
      product,
      relatedProducts,
      currentPage: 'product-detail',
      showSearchBar: false
    });
  } catch (error) {
    console.error('Product detail page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load product details.',
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

module.exports = router;