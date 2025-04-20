// routes/admin/brands.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const { Brand } = require('../../models/Product-brand-models');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images/brands');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename
    const brandName = req.body.name ? req.body.name.toLowerCase().replace(/\s+/g, '-') : '';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, brandName + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Brands list
router.get('/', isAdminAuthenticated, logAdminActivity('view_brands'), async (req, res) => {
  try {
    // Get brands
    const brands = await Brand.findAll();
    
    res.render('admin/brands/index', {
      title: 'Manage Brands - MOVA Admin',
      layout: 'admin/layouts/main',
      brands,
      section: 'brands',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading admin brands page:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load brands list',
      layout: 'admin/layouts/main',
      section: 'brands'
    });
  }
});

// New brand form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_brand'), (req, res) => {
  res.render('admin/brands/new', {
    title: 'Add New Brand - MOVA Admin',
    layout: 'admin/layouts/main',
    section: 'brands'
  });
});

// Create brand
router.post('/new', isAdminAuthenticated, upload.single('logo'), [
  body('name').notEmpty().withMessage('Brand name is required'),
  body('cashback_percentage').isFloat({ min: 0, max: 100 }).withMessage('Cashback percentage must be between 0 and 100'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('create_brand'), async (req, res) => {
  try {
    const { name, cashback_percentage, description, priority } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/brands/new', {
        title: 'Add New Brand - MOVA Admin',
        layout: 'admin/layouts/main',
        formData: req.body,
        errors: errors.array(),
        section: 'brands'
      });
    }
    
    // Check if brand already exists
    const existingBrand = await Brand.findByName(name);
    if (existingBrand) {
      return res.render('admin/brands/new', {
        title: 'Add New Brand - MOVA Admin',
        layout: 'admin/layouts/main',
        formData: req.body,
        errors: [{ msg: 'Brand with this name already exists' }],
        section: 'brands'
      });
    }
    
    // Process file upload
    let logoUrl = '/images/default-brand-logo.png'; // Default logo
    if (req.file) {
      logoUrl = `/images/brands/${req.file.filename}`;
    }
    
    // Create brand in database
    const [result] = await db.execute(
      'INSERT INTO brands (name, description, cashback_percentage, logo_url, priority, products_count) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, cashback_percentage, logoUrl, priority || 0, 0]
    );
    
    req.session.successMessage = 'Brand created successfully';
    res.redirect('/admin/brands');
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).render('admin/brands/new', {
      title: 'Add New Brand - MOVA Admin',
      layout: 'admin/layouts/main',
      formData: req.body,
      errors: [{ msg: 'Failed to create brand' }],
      section: 'brands'
    });
  }
});

// View brand details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_brand_details'), async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Get brand details
    const brand = await Brand.findById(brandId);
    
    if (!brand) {
      return res.status(404).render('admin/error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'brands'
      });
    }
    
    // Get products for this brand
    const [products] = await db.execute(
      'SELECT * FROM products WHERE brand = ? ORDER BY id DESC',
      [brand.name]
    );
    
    res.render('admin/brands/details', {
      title: `Brand: ${brand.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      brand,
      products,
      section: 'brands',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading brand details:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load brand details',
      layout: 'admin/layouts/main',
      section: 'brands'
    });
  }
});

// Edit brand form
router.get('/:id/edit', isAdminAuthenticated, logAdminActivity('view_edit_brand'), async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Get brand details
    const brand = await Brand.findById(brandId);
    
    if (!brand) {
      return res.status(404).render('admin/error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'brands'
      });
    }
    
    res.render('admin/brands/edit', {
      title: `Edit Brand: ${brand.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      brand,
      section: 'brands'
    });
  } catch (error) {
    console.error('Error loading brand edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load brand edit form',
      layout: 'admin/layouts/main',
      section: 'brands'
    });
  }
});

// Update brand
router.post('/:id/edit', isAdminAuthenticated, upload.single('logo'), [
  body('name').notEmpty().withMessage('Brand name is required'),
  body('cashback_percentage').isFloat({ min: 0, max: 100 }).withMessage('Cashback percentage must be between 0 and 100'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('update_brand'), async (req, res) => {
  try {
    const brandId = req.params.id;
    const { name, cashback_percentage, description, priority } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get brand for re-rendering the form
      const brand = await Brand.findById(brandId);
      
      return res.render('admin/brands/edit', {
        title: `Edit Brand: ${brand.name} - MOVA Admin`,
        layout: 'admin/layouts/main',
        brand: { ...brand, ...req.body },
        errors: errors.array(),
        section: 'brands'
      });
    }
    
    // Get current brand
    const currentBrand = await Brand.findById(brandId);
    
    if (!currentBrand) {
      return res.status(404).render('admin/error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'brands'
      });
    }
    
    // Check if another brand already uses this name
    if (name !== currentBrand.name) {
      const existingBrand = await Brand.findByName(name);
      if (existingBrand) {
        return res.render('admin/brands/edit', {
          title: `Edit Brand: ${currentBrand.name} - MOVA Admin`,
          layout: 'admin/layouts/main',
          brand: { ...currentBrand, ...req.body },
          errors: [{ msg: 'Another brand with this name already exists' }],
          section: 'brands'
        });
      }
    }
    
    // Process file upload
    let logoUrl = currentBrand.logo_url; // Keep existing logo by default
    if (req.file) {
      logoUrl = `/images/brands/${req.file.filename}`;
      
      // Delete old logo file if it's not the default
      if (currentBrand.logo_url && !currentBrand.logo_url.includes('default-brand-logo.png')) {
        const oldLogoPath = path.join(__dirname, '../../public', currentBrand.logo_url);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }
    
    // Update brand in database
    const [result] = await db.execute(
      'UPDATE brands SET name = ?, description = ?, cashback_percentage = ?, logo_url = ?, priority = ? WHERE id = ?',
      [name, description, cashback_percentage, logoUrl, priority || 0, brandId]
    );
    
    // If the brand name was changed, update all products with this brand
    if (name !== currentBrand.name) {
      await db.execute(
        'UPDATE products SET brand = ? WHERE brand = ?',
        [name, currentBrand.name]
      );
    }
    
    req.session.successMessage = 'Brand updated successfully';
    res.redirect(`/admin/brands/${brandId}`);
  } catch (error) {
    console.error('Error updating brand:', error);
    req.session.errorMessage = 'Failed to update brand';
    res.redirect(`/admin/brands/${req.params.id}/edit`);
  }
});

// Delete brand confirmation
router.get('/:id/delete', isAdminAuthenticated, logAdminActivity('view_delete_brand'), async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Get brand details
    const brand = await Brand.findById(brandId);
    
    if (!brand) {
      return res.status(404).render('admin/error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'brands'
      });
    }
    
    // Check if products exist for this brand
    const [products] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE brand = ?',
      [brand.name]
    );
    
    const hasProducts = products[0].count > 0;
    
    res.render('admin/brands/delete', {
      title: `Delete Brand: ${brand.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      brand,
      hasProducts,
      section: 'brands'
    });
  } catch (error) {
    console.error('Error loading brand delete confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load brand delete confirmation',
      layout: 'admin/layouts/main',
      section: 'brands'
    });
  }
});

// Delete brand
router.post('/:id/delete', isAdminAuthenticated, logAdminActivity('delete_brand'), async (req, res) => {
  try {
    const brandId = req.params.id;
    const { confirm, delete_products } = req.body;
    
    // Confirm deletion
    if (confirm !== 'yes') {
      req.session.errorMessage = 'Brand deletion was not confirmed';
      return res.redirect(`/admin/brands/${brandId}/delete`);
    }
    
    // Get brand details
    const brand = await Brand.findById(brandId);
    
    if (!brand) {
      req.session.errorMessage = 'Brand not found or already deleted';
      return res.redirect('/admin/brands');
    }
    
    // If user chose to delete products
    if (delete_products === 'yes') {
      // Get all products for this brand to delete their images
      const [products] = await db.execute(
        'SELECT id, image_url FROM products WHERE brand = ?',
        [brand.name]
      );
      
      // Delete product images
      products.forEach(product => {
        if (product.image_url && !product.image_url.includes('default-product.jpg')) {
          const imagePath = path.join(__dirname, '../../public', product.image_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
      
      // Delete products
      await db.execute(
        'DELETE FROM products WHERE brand = ?',
        [brand.name]
      );
    } else {
      // Set products to have no brand
      await db.execute(
        'UPDATE products SET brand = "Unbranded" WHERE brand = ?',
        [brand.name]
      );
    }
    
    // Delete brand logo if not the default
    if (brand.logo_url && !brand.logo_url.includes('default-brand-logo.png')) {
      const logoPath = path.join(__dirname, '../../public', brand.logo_url);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    // Delete brand
    await db.execute(
      'DELETE FROM brands WHERE id = ?',
      [brandId]
    );
    
    req.session.successMessage = 'Brand deleted successfully';
    res.redirect('/admin/brands');
  } catch (error) {
    console.error('Error deleting brand:', error);
    req.session.errorMessage = 'Failed to delete brand';
    res.redirect(`/admin/brands/${req.params.id}/delete`);
  }
});

// Sync product counts
router.post('/sync-product-counts', isAdminAuthenticated, logAdminActivity('sync_product_counts'), async (req, res) => {
  try {
    await Brand.syncProductCounts();
    
    req.session.successMessage = 'Product counts synchronized successfully';
    res.redirect('/admin/brands');
  } catch (error) {
    console.error('Error syncing product counts:', error);
    req.session.errorMessage = 'Failed to synchronize product counts';
    res.redirect('/admin/brands');
  }
});

// Search brands
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/brands');
    }
    
    // Search brands by name
    const [brands] = await db.execute(
      'SELECT * FROM brands WHERE name LIKE ? ORDER BY priority DESC, cashback_percentage DESC',
      [`%${q}%`]
    );
    
    res.render('admin/brands/search', {
      title: 'Brand Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      brands,
      searchTerm: q,
      section: 'brands'
    });
  } catch (error) {
    console.error('Error searching brands:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search brands',
      layout: 'admin/layouts/main',
      section: 'brands'
    });
  }
});

// Update brand priority
router.post('/:id/update-priority', isAdminAuthenticated, [
  body('priority').isInt({ min: 0 }).withMessage('Priority must be a non-negative integer')
], logAdminActivity('update_brand_priority'), async (req, res) => {
  try {
    const brandId = req.params.id;
    const { priority } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.errorMessage = 'Invalid priority value';
      return res.redirect(`/admin/brands/${brandId}`);
    }
    
    // Update brand priority
    await Brand.updatePriority(brandId, priority);
    
    req.session.successMessage = 'Brand priority updated successfully';
    res.redirect(`/admin/brands/${brandId}`);
  } catch (error) {
    console.error('Error updating brand priority:', error);
    req.session.errorMessage = 'Failed to update brand priority';
    res.redirect(`/admin/brands/${req.params.id}`);
  }
});

module.exports = router;