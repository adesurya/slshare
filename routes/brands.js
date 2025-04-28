const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');

console.log('Loading brands routes module...');

// Get all brands
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all brands...');
    // Fetch brands from database
    const brands = await Brand.findAll();
    console.log(`Retrieved ${brands.length} brands`);
    
    // For each brand, get a few products using findByBrand instead of findByBrandId
    for (let brand of brands) {
      try {
        // Menggunakan findByBrand dengan nama brand, bukan ID
        brand.products = await Product.findByBrand(brand.name, 5, 0);
        console.log(`Found ${brand.products.length} products for brand ${brand.name}`);
      } catch (err) {
        console.error(`Error loading products for brand ${brand.name}:`, err);
        // Fallback to empty products array if there's an error
        brand.products = [];
      }
    }
    
    res.render('brands/index', {
      title: 'Brands - MOVA',
      brands,
      currentPage: 'brands', // Penting: set currentPage ke 'brands'
      showSearchBar: true
    });
  } catch (error) {
    console.error('Brands page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brands page',
      currentPage: ''
    });
  }
});

// API endpoint to get products for a brand
// THIS MUST COME BEFORE THE /:id ROUTE!
console.log('Registering /brands/:id/products endpoint');
router.get('/:id/products', async (req, res) => {
  console.log(`GET /brands/${req.params.id}/products request received`);
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`Looking up brand ID: ${id}, limit: ${limit}`);
    
    const brand = await Brand.findById(id);
    
    if (!brand) {
      console.log(`Brand ID ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found' 
      });
    }
    
    console.log(`Found brand: ${brand.name}, getting products...`);
    
    const products = await Product.findByBrand(brand.name, limit, 0);
    console.log(`Found ${products.length} products for brand ${brand.name}`);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.json({
      success: true,
      brand,
      products
    });
  } catch (error) {
    console.error('Error fetching brand products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch brand products',
      error: error.message
    });
  }
});

// Get brand details and products
router.get('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;
    console.log(`Accessing brand with ID: ${brandId}`);
    
    // Fetch brand
    const brand = await Brand.findById(brandId);
    
    if (!brand) {
      return res.status(404).render('error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found.',
        currentPage: 'brands' // Tetap set currentPage dengan benar saat error
      });
    }
    
    console.log(`Found brand: ${brand.name}, fetching products...`);
    
    // Fetch products for this brand using findByBrand dengan nama brand
    const products = await Product.findByBrand(brand.name, 10, 0);
    console.log(`Retrieved ${products.length} products for brand ${brand.name}`);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.render('brands/show', {
      title: `${brand.name} - MOVA`,
      brand,
      products,
      currentPage: 'brands', // Penting: set currentPage ke 'brands'
      showSearchBar: true
    });
  } catch (error) {
    console.error('Brand details error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brand details',
      currentPage: 'brands' // Bahkan saat error, tetap set currentPage dengan benar
    });
  }
});

console.log('All brand routes registered!');
module.exports = router;