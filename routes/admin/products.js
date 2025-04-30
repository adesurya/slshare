// routes/admin/products.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const { Product, Brand } = require('../../models/Product-brand-models');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images/products');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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

// Products list
router.get('/', isAdminAuthenticated, logAdminActivity('view_products'), async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get sort parameters (default to ID ascending)
    const sortField = req.query.sort || 'id';
    const sortOrder = req.query.order || 'ASC';
    
    // Validate sort field to prevent SQL injection
    const validSortFields = ['id', 'name', 'price', 'brand', 'category', 'created_at'];
    const validatedSortField = validSortFields.includes(sortField) ? sortField : 'id';
    
    // Validate sort order to prevent SQL injection
    const validatedSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';
    
    // Use a simpler query without parameters for LIMIT/OFFSET
    const query = `
      SELECT * FROM products 
      ORDER BY ${validatedSortField} ${validatedSortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Execute the query without parameters for LIMIT/OFFSET
    const [products] = await db.query(query);
    
    // Count total products for pagination
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM products');
    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Get all categories for filter dropdown
    const [categoriesResult] = await db.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categories = categoriesResult.map(row => row.category);
    
    res.render('admin/products/index', {
      title: 'Manage Products - MOVA Admin',
      layout: 'admin/layouts/main',
      products,
      categories,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages
      },
      sorting: {
        field: validatedSortField,
        order: validatedSortOrder
      },
      section: 'products',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading admin products page:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load products list: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// New product form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_product'), async (req, res) => {
  try {
    // Get all brands for dropdown
    const brands = await Brand.findAll();
    
    res.render('admin/products/new', {
      title: 'Add New Product - MOVA Admin',
      layout: 'admin/layouts/main',
      brands,
      section: 'products',
      req: req  // Pass the req object to the template
    });
  } catch (error) {
    console.error('Error loading new product form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load new product form: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Create product
router.post('/new', isAdminAuthenticated, upload.single('image'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('cashback_percentage').isFloat({ min: 0, max: 100 }).withMessage('Cashback percentage must be between 0 and 100')
], logAdminActivity('create_product'), async (req, res) => {
  try {
    const { name, price, brand, category, description, cashback_percentage, featured } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get all brands for dropdown
      const brands = await Brand.findAll();
      
      return res.render('admin/products/new', {
        title: 'Add New Product - MOVA Admin',
        layout: 'admin/layouts/main',
        formData: req.body,
        brands,
        errors: errors.array(),
        section: 'products'
      });
    }
    
    // Process file upload
    let imageUrl = '/images/products/default-product.jpg'; // Default image
    if (req.file) {
      imageUrl = `/images/products/${req.file.filename}`;
    }
    
    // Set featured status (0 if not checked, 1 if checked)
    const isFeatured = featured ? 1 : 0;
    
    // Create product in database
    const [result] = await db.execute(
      'INSERT INTO products (name, price, brand, category, description, image_url, cashback_percentage, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, brand, category, description, imageUrl, cashback_percentage, isFeatured]
    );
    
    // Update product count for the brand
    await db.execute(
      'UPDATE brands SET products_count = products_count + 1 WHERE name = ?',
      [brand]
    );
    
    req.session.successMessage = 'Product created successfully';
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);
    // Get all brands for dropdown
    const brands = await Brand.findAll();
    
    res.status(500).render('admin/products/new', {
      title: 'Add New Product - MOVA Admin',
      layout: 'admin/layouts/main',
      formData: req.body,
      brands,
      errors: [{ msg: 'Failed to create product: ' + error.message }],
      section: 'products'
    });
  }
});

// View product details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_product_details'), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Product Not Found',
        message: 'The product you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'products'
      });
    }
    
    // Ensure numeric fields are properly converted to numbers
    product.price = Number(product.price);
    product.cashback_percentage = product.cashback_percentage === null ? 
      0 : Number(product.cashback_percentage);
    
    // Get brand details
    const brand = await Brand.findByName(product.brand);
    
    // Calculate cashback amount
    const cashbackAmount = await Product.calculateCashback(productId);
    
    res.render('admin/products/details', {
      title: `Product: ${product.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      product,
      brand,
      cashbackAmount,
      section: 'products',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading product details:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load product details: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Edit product form
router.get('/:id/edit', isAdminAuthenticated, logAdminActivity('view_edit_product'), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Product Not Found',
        message: 'The product you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'products'
      });
    }
    
    // Get all brands for dropdown
    const brands = await Brand.findAll();
    
    res.render('admin/products/edit', {
      title: `Edit Product: ${product.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      product,
      brands,
      section: 'products'
    });
  } catch (error) {
    console.error('Error loading product edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load product edit form',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Update product
router.post('/:id/edit', isAdminAuthenticated, upload.single('image'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('cashback_percentage').isFloat({ min: 0, max: 100 }).withMessage('Cashback percentage must be between 0 and 100')
], logAdminActivity('update_product'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, brand, category, description, cashback_percentage } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get all brands for dropdown
      const brands = await Brand.findAll();
      
      return res.render('admin/products/edit', {
        title: `Edit Product - MOVA Admin`,
        layout: 'admin/layouts/main',
        product: { id: productId, ...req.body },
        brands,
        errors: errors.array(),
        section: 'products'
      });
    }
    
    // Get current product
    const currentProduct = await Product.findById(productId);
    
    if (!currentProduct) {
      return res.status(404).render('admin/error', {
        title: 'Product Not Found',
        message: 'The product you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'products'
      });
    }
    
    // Process file upload
    let imageUrl = currentProduct.image_url; // Keep existing image by default
    if (req.file) {
      imageUrl = `/images/products/${req.file.filename}`;
      
      // Delete old image file if it's not the default
      if (currentProduct.image_url && !currentProduct.image_url.includes('default-product.jpg')) {
        const oldImagePath = path.join(__dirname, '../../public', currentProduct.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // Check if brand has changed
    const brandChanged = brand !== currentProduct.brand;
    
    // Update product in database
    const [result] = await db.execute(
      'UPDATE products SET name = ?, price = ?, brand = ?, category = ?, description = ?, image_url = ?, cashback_percentage = ? WHERE id = ?',
      [name, price, brand, category, description, imageUrl, cashback_percentage, productId]
    );
    
    // If brand changed, update brand product counts
    if (brandChanged) {
      // Decrement old brand count
      await db.execute(
        'UPDATE brands SET products_count = products_count - 1 WHERE name = ?',
        [currentProduct.brand]
      );
      
      // Increment new brand count
      await db.execute(
        'UPDATE brands SET products_count = products_count + 1 WHERE name = ?',
        [brand]
      );
    }
    
    req.session.successMessage = 'Product updated successfully';
    res.redirect(`/admin/products/${productId}`);
  } catch (error) {
    console.error('Error updating product:', error);
    req.session.errorMessage = 'Failed to update product';
    res.redirect(`/admin/products/${req.params.id}/edit`);
  }
});

// Delete product confirmation
router.get('/:id/delete', isAdminAuthenticated, logAdminActivity('view_delete_product'), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Product Not Found',
        message: 'The product you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'products'
      });
    }
    
    res.render('admin/products/delete', {
      title: `Delete Product: ${product.name} - MOVA Admin`,
      layout: 'admin/layouts/main',
      product,
      section: 'products'
    });
  } catch (error) {
    console.error('Error loading product delete confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load product delete confirmation',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Delete product
router.post('/:id/delete', isAdminAuthenticated, logAdminActivity('delete_product'), async (req, res) => {
  try {
    const productId = req.params.id;
    const { confirm } = req.body;
    
    // Confirm deletion
    if (confirm !== 'yes') {
      req.session.errorMessage = 'Product deletion was not confirmed';
      return res.redirect(`/admin/products/${productId}/delete`);
    }
    
    // Get product details
    const product = await Product.findById(productId);
    
    if (!product) {
      req.session.errorMessage = 'Product not found or already deleted';
      return res.redirect('/admin/products');
    }
    
    // Delete product image if not the default
    if (product.image_url && !product.image_url.includes('default-product.jpg')) {
      const imagePath = path.join(__dirname, '../../public', product.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete product
    const [result] = await db.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    );
    
    // Update brand product count
    await db.execute(
      'UPDATE brands SET products_count = products_count - 1 WHERE name = ?',
      [product.brand]
    );
    
    req.session.successMessage = 'Product deleted successfully';
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    req.session.errorMessage = 'Failed to delete product';
    res.redirect(`/admin/products/${req.params.id}/delete`);
  }
});

// Search products
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/products');
    }
    
    // Search products
    const products = await Product.search(q);
    
    res.render('admin/products/search', {
      title: 'Product Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      products,
      searchTerm: q,
      section: 'products'
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search products',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Filter products by category
router.get('/category/:category', isAdminAuthenticated, async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get products by category
    const products = await Product.findByCategory(category, limit, offset);
    
    // Count total products in this category for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE category = ?',
      [category]
    );
    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.render('admin/products/category', {
      title: `Products: ${category} - MOVA Admin`,
      layout: 'admin/layouts/main',
      products,
      category,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages
      },
      section: 'products'
    });
  } catch (error) {
    console.error('Error loading category products:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load category products',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Filter products by brand
router.get('/brand/:brandName', isAdminAuthenticated, async (req, res) => {
  try {
    const { brandName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get products by brand
    const products = await Product.findByBrand(brandName, limit, offset);
    
    // Get brand details
    const brand = await Brand.findByName(brandName);
    
    // Count total products for this brand for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE brand = ?',
      [brandName]
    );
    const totalProducts = countResult[0].count;
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.render('admin/products/brand', {
      title: `Products by ${brandName} - MOVA Admin`,
      layout: 'admin/layouts/main',
      products,
      brand,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages
      },
      section: 'products'
    });
  } catch (error) {
    console.error('Error loading brand products:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load brand products',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Bulk import products form
router.get('/bulk-import', isAdminAuthenticated, logAdminActivity('view_bulk_import'), async (req, res) => {
  try {
    // Get all brands for dropdown
    const brands = await Brand.findAll();
    
    res.render('admin/products/bulk-import', {
      title: 'Bulk Import Products - MOVA Admin',
      layout: 'admin/layouts/main',
      brands,
      section: 'products'
    });
  } catch (error) {
    console.error('Error loading bulk import form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load bulk import form',
      layout: 'admin/layouts/main',
      section: 'products'
    });
  }
});

// Process bulk import
router.post('/bulk-import', isAdminAuthenticated, logAdminActivity('bulk_import_products'), async (req, res) => {
  try {
    const { products_data, brand } = req.body;
    
    // Validate brand exists
    const brandExists = await Brand.findByName(brand);
    if (!brandExists) {
      return res.render('admin/products/bulk-import', {
        title: 'Bulk Import Products - MOVA Admin',
        layout: 'admin/layouts/main',
        brands: await Brand.findAll(),
        errors: [{ msg: 'Selected brand does not exist' }],
        formData: req.body,
        section: 'products'
      });
    }
    
    // Parse products data (CSV or JSON format)
    let parsedProducts = [];
    try {
      // Simple parsing assuming JSON format
      // For a real app, you'd want more robust parsing with validation
      parsedProducts = JSON.parse(products_data);
    } catch (parseError) {
      return res.render('admin/products/bulk-import', {
        title: 'Bulk Import Products - MOVA Admin',
        layout: 'admin/layouts/main',
        brands: await Brand.findAll(),
        errors: [{ msg: 'Invalid products data format. Please provide valid JSON.' }],
        formData: req.body,
        section: 'products'
      });
    }
    
    // Check if we have any products to import
    if (!Array.isArray(parsedProducts) || parsedProducts.length === 0) {
      return res.render('admin/products/bulk-import', {
        title: 'Bulk Import Products - MOVA Admin',
        layout: 'admin/layouts/main',
        brands: await Brand.findAll(),
        errors: [{ msg: 'No products found in the provided data' }],
        formData: req.body,
        section: 'products'
      });
    }
    
    // Import products
    let importedCount = 0;
    for (const product of parsedProducts) {
      // Validate required fields
      if (!product.name || !product.price || !product.category) {
        continue; // Skip invalid products
      }
      
      // Insert product
      await db.execute(
        'INSERT INTO products (name, price, brand, category, description, image_url, cashback_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          product.name,
          parseFloat(product.price),
          brand,
          product.category,
          product.description || '',
          product.image_url || '/images/products/default-product.jpg',
          parseFloat(product.cashback_percentage || brandExists.cashback_percentage)
        ]
      );
      
      importedCount++;
    }
    
    // Update brand product count
    await db.execute(
      'UPDATE brands SET products_count = products_count + ? WHERE name = ?',
      [importedCount, brand]
    );
    
    req.session.successMessage = `Successfully imported ${importedCount} products`;
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).render('admin/products/bulk-import', {
      title: 'Bulk Import Products - MOVA Admin',
      layout: 'admin/layouts/main',
      brands: await Brand.findAll(),
      errors: [{ msg: 'Failed to import products: ' + error.message }],
      formData: req.body,
      section: 'products'
    });
  }
});

module.exports = router;