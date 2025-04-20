// routes/admin/index.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator'); // Make sure this is imported
const db = require('../../config/database'); // Make sure this is imported

// Import routes
const authRoutes = require('./auth');
// Check if these files exist and export router objects
const dashboardRoutes = require('./dashboard');
const usersRoutes = require('./users');
const brandsRoutes = require('./brands');
const productsRoutes = require('./products');
const transactionsRoutes = require('./transactions');

// Import middleware
const { isAdminAuthenticated, setCurrentAdmin } = require('../../middlewares/adminAuth');
const Admin = require('../../models/Admin');

// Apply setCurrentAdmin middleware to all admin routes
router.use(setCurrentAdmin);

// Admin authentication routes
router.use('/', authRoutes);

// Admin dashboard routes - make sure dashboardRoutes is a router, not an object
router.use('/dashboard', isAdminAuthenticated, dashboardRoutes);

// Users management routes
router.use('/users', isAdminAuthenticated, usersRoutes);

// Brands management routes
router.use('/brands', isAdminAuthenticated, brandsRoutes);

// Products management routes
router.use('/products', isAdminAuthenticated, productsRoutes);

// Transactions management routes
router.use('/transactions', isAdminAuthenticated, transactionsRoutes);

// Admin home route - redirect to dashboard
router.get('/', isAdminAuthenticated, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Create initial superadmin account (if no admin accounts exist)
router.get('/setup', async (req, res) => {
  try {
    // Check if any admin accounts exist
    const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    
    if (adminCount[0].count > 0) {
      return res.render('admin/setup-complete', {
        title: 'Setup Complete - MOVA Admin',
        layout: 'admin/layouts/auth'
      });
    }
    
    res.render('admin/setup', {
      title: 'Initial Setup - MOVA Admin',
      layout: 'admin/layouts/auth'
    });
  } catch (error) {
    console.error('Error checking admin setup:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to check admin setup',
      layout: 'admin/layouts/auth'
    });
  }
});

// Process initial setup
router.post('/setup', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check if any admin accounts exist
    const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    
    if (adminCount[0].count > 0) {
      return res.render('admin/setup-complete', {
        title: 'Setup Complete - MOVA Admin',
        layout: 'admin/layouts/auth'
      });
    }
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/setup', {
        title: 'Initial Setup - MOVA Admin',
        layout: 'admin/layouts/auth',
        formData: req.body,
        errors: errors.array()
      });
    }
    
    const { username, email, password } = req.body;
    
    // Create superadmin account
    await Admin.create({
      username,
      email,
      password,
      full_name: 'Super Administrator',
      role: 'superadmin'
    });
    
    res.render('admin/setup-success', {
      title: 'Setup Successful - MOVA Admin',
      layout: 'admin/layouts/auth'
    });
  } catch (error) {
    console.error('Error during admin setup:', error);
    res.status(500).render('admin/setup', {
      title: 'Initial Setup - MOVA Admin',
      layout: 'admin/layouts/auth',
      formData: req.body,
      errors: [{ msg: 'Failed to create admin account: ' + error.message }]
    });
  }
});

// 404 handler for admin routes
router.use((req, res) => {
  res.status(404).render('admin/error', {
    title: 'Page Not Found',
    message: 'The admin page you requested could not be found.',
    layout: res.locals.isAdminAuthenticated ? 'admin/layouts/main' : 'admin/layouts/auth'
  });
});

module.exports = router;