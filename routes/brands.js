const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');

console.log('Loading brands routes module...');

// Get all brands
router.get('/', async (req, res) => {
  console.log('GET /brands request received');
  try {
    const brands = await Brand.findAll();
    
    res.render('brands/index', {
      title: 'Brand Pilihan - MOVA',
      brands,
      currentPage: 'brands'
    });
  } catch (error) {
    console.error('Brands page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brands page'
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
  console.log(`GET /brands/${req.params.id} request received`);
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).render('error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found'
      });
    }
    
    const products = await Product.findByBrand(brand.name);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.render('brands/detail', {
      title: `${brand.name} - MOVA`,
      brand,
      products,
      currentPage: 'brands'
    });
  } catch (error) {
    console.error('Brand detail page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brand details'
    });
  }
});

console.log('All brand routes registered!');
module.exports = router;