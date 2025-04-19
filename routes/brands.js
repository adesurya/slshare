const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.findAll();
    
    res.render('brands/index', {
      title: 'Brand Pilihan - MOVA',
      brands
    });
  } catch (error) {
    console.error('Brands page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brands page'
    });
  }
});

// Get brand details and products
router.get('/:id', async (req, res) => {
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
      products
    });
  } catch (error) {
    console.error('Brand detail page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brand details'
    });
  }
});

module.exports = router;