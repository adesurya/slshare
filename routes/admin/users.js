// routes/admin/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const db = require('../../config/database');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images/users');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Model classes
class User {
  // Find all users with pagination and filtering
  static async findAll(limit = 20, offset = 0, filters = {}) {
    try {
      let query = 'SELECT * FROM users WHERE 1=1';
      const queryParams = [];
      
      // Apply role filter (adjust if you add a role column later)
      // if (filters.role) {
      //   query += ' AND role = ?';
      //   queryParams.push(filters.role);
      // }
      
      // Apply verification status filter
      if (filters.status === 'verified') {
        query += ' AND is_verified = 1';
      } else if (filters.status === 'unverified') {
        query += ' AND is_verified = 0';
      }
      
      // Apply search term filter
      if (filters.searchTerm) {
        query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
        const searchPattern = `%${filters.searchTerm}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      // Add ordering and pagination
      query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      queryParams.push(Number(limit), Number(offset));
      
      const [users] = await db.query(query, queryParams);
      return users;
    } catch (error) {
      console.error('Error in User.findAll:', error);
      throw error;
    }
  }
  
  // Count total users with filters
  static async countAll(filters = {}) {
    try {
      let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
      const queryParams = [];
      
      // Apply role filter (adjust if you add a role column later)
      // if (filters.role) {
      //   query += ' AND role = ?';
      //   queryParams.push(filters.role);
      // }
      
      // Apply verification status filter
      if (filters.status === 'verified') {
        query += ' AND is_verified = 1';
      } else if (filters.status === 'unverified') {
        query += ' AND is_verified = 0';
      }
      
      // Apply search term filter
      if (filters.searchTerm) {
        query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
        const searchPattern = `%${filters.searchTerm}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
      }
      
      const [result] = await db.query(query, queryParams);
      return result[0].count;
    } catch (error) {
      console.error('Error in User.countAll:', error);
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id) {
    try {
      const [users] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw error;
    }
  }
  
  // Get user statistics
  static async getStats() {
    try {
      // Get total users
      const [totalResult] = await db.query('SELECT COUNT(*) as count FROM users');
      const totalUsers = totalResult[0].count;
      
      // Get verified users
      const [verifiedResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_verified = 1');
      const verifiedUsers = verifiedResult[0].count;
      
      // Get admin users (assuming admin users might be identified later)
      // Currently set to 0 since there's no role column
      const adminUsers = 0;
      
      // Get new users this month
      const [newUsersResult] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_FORMAT(NOW(), "%Y-%m-01")'
      );
      const newUsersMonth = newUsersResult[0].count;
      
      return {
        total_users: totalUsers,
        active_users: verifiedUsers, // Using verified as "active"
        admin_users: adminUsers,
        new_users_month: newUsersMonth
      };
    } catch (error) {
      console.error('Error in User.getStats:', error);
      throw error;
    }
  }
  
  // Get user order statistics (if orders table exists)
  static async getUserStats(userId) {
    try {
      // Check if orders table exists
      let [tables] = await db.query("SHOW TABLES LIKE 'orders'");
      
      // Default values if orders don't exist
      let totalOrders = 0;
      let totalSpent = 0;
      let totalCashback = 0;
      let lastOrder = null;
      
      if (tables.length > 0) {
        // Get total orders
        const [ordersResult] = await db.query(
          'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
          [userId]
        );
        totalOrders = ordersResult[0].count;
        
        // Get total spent
        const [spentResult] = await db.query(
          'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status != "cancelled"',
          [userId]
        );
        totalSpent = spentResult[0].total;
        
        // Get total cashback
        const [cashbackResult] = await db.query(
          'SELECT COALESCE(SUM(cashback_amount), 0) as total FROM orders WHERE user_id = ? AND status = "completed"',
          [userId]
        );
        totalCashback = cashbackResult[0].total;
        
        // Get last order date
        const [lastOrderResult] = await db.query(
          'SELECT created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [userId]
        );
        if (lastOrderResult.length > 0) {
          lastOrder = lastOrderResult[0].created_at;
        }
      }
      
      return {
        total_orders: totalOrders,
        total_spent: totalSpent,
        total_cashback: totalCashback,
        last_order: lastOrder
      };
    } catch (error) {
      console.error('Error in User.getUserStats:', error);
      // Return default values if error (e.g., table doesn't exist)
      return {
        total_orders: 0,
        total_spent: 0,
        total_cashback: 0,
        last_order: null
      };
    }
  }
  
  // Get user recent orders (if orders table exists)
  static async getUserOrders(userId, limit = 5) {
    try {
      // Check if orders table exists
      let [tables] = await db.query("SHOW TABLES LIKE 'orders'");
      
      if (tables.length > 0) {
        const [orders] = await db.query(
          'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
          [userId, Number(limit)]
        );
        return orders;
      }
      
      return []; // Return empty array if orders table doesn't exist
    } catch (error) {
      console.error('Error in User.getUserOrders:', error);
      return []; // Return empty array on error
    }
  }
  
  // Get user activities (if user_activities table exists)
  static async getUserActivities(userId, limit = 10) {
    try {
      // Check if user_activities table exists
      let [tables] = await db.query("SHOW TABLES LIKE 'user_activities'");
      
      if (tables.length > 0) {
        const [activities] = await db.query(
          'SELECT * FROM user_activities WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
          [userId, Number(limit)]
        );
        return activities;
      }
      
      return []; // Return empty array if user_activities table doesn't exist
    } catch (error) {
      console.error('Error in User.getUserActivities:', error);
      return []; // Return empty array on error
    }
  }
}

// Users list
router.get('/', isAdminAuthenticated, logAdminActivity('view_users'), async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const filters = {
      status: req.query.status || null,
      searchTerm: req.query.q || null
    };
    
    // Build query params string for pagination links
    let queryParams = '';
    if (filters.status) queryParams += `&status=${filters.status}`;
    if (filters.searchTerm) queryParams += `&q=${filters.searchTerm}`;
    
    // Get users with pagination and filters
    const users = await User.findAll(limit, offset, filters);
    
    // Count total users for pagination
    const totalUsers = await User.countAll(filters);
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Get user statistics
    const stats = await User.getStats();
    
    res.render('admin/users/index', {
      title: 'Manage Users - MOVA Admin',
      layout: 'admin/layouts/main',
      users,
      stats,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages
      },
      statusFilter: filters.status,
      searchTerm: filters.searchTerm,
      queryParams,
      section: 'users',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading admin users page:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load users list: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Search users
router.get('/search', isAdminAuthenticated, logAdminActivity('search_users'), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/users');
    }
    
    // Redirect to the main users page with search parameter
    res.redirect(`/admin/users?q=${encodeURIComponent(q)}`);
  } catch (error) {
    console.error('Error searching users:', error);
    req.session.errorMessage = 'Failed to search users';
    res.redirect('/admin/users');
  }
});

// New user form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_user'), async (req, res) => {
  try {
    res.render('admin/users/new', {
      title: 'Add New User - MOVA Admin',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  } catch (error) {
    console.error('Error loading new user form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load new user form',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Create user
router.post('/new', isAdminAuthenticated, upload.single('profile_image'), [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required')
], logAdminActivity('create_user'), async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/users/new', {
        title: 'Add New User - MOVA Admin',
        layout: 'admin/layouts/main',
        formData: req.body,
        errors: errors.array(),
        section: 'users'
      });
    }
    
    // Check if username or email already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUsers.length > 0) {
      return res.render('admin/users/new', {
        title: 'Add New User - MOVA Admin',
        layout: 'admin/layouts/main',
        formData: req.body,
        errors: [{ msg: 'Username or email already in use' }],
        section: 'users'
      });
    }
    
    // Process profile image upload
    let profileImage = null;
    if (req.file) {
      profileImage = `/images/users/${req.file.filename}`;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, profile_image, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, profileImage, 1] // Setting is_verified to 1 by default for admin-created users
    );
    
    req.session.successMessage = 'User created successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).render('admin/users/new', {
      title: 'Add New User - MOVA Admin',
      layout: 'admin/layouts/main',
      formData: req.body,
      errors: [{ msg: 'Failed to create user: ' + error.message }],
      section: 'users'
    });
  }
});

// View user details
// Update the route for user details in routes/admin/users.js

// View user details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_user_details'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    // Get user statistics
    const stats = await User.getUserStats(userId);
    
    // Get user recent orders - fetch more for pagination later if needed
    const orders = await User.getUserOrders(userId, 10);
    
    // Get user activities
    const activities = await User.getUserActivities(userId, 15);
    
    res.render('admin/users/details', {
      title: `User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      stats,
      orders,
      activities,
      section: 'users',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading user details:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user details: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Edit user form
router.get('/:id/edit', isAdminAuthenticated, logAdminActivity('view_edit_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    res.render('admin/users/edit', {
      title: `Edit User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      section: 'users'
    });
  } catch (error) {
    console.error('Error loading user edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user edit form',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Update user
router.post('/:id/edit', isAdminAuthenticated, upload.single('profile_image'), [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('full_name').notEmpty().withMessage('Full name is required')
], logAdminActivity('update_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, is_verified } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/users/edit', {
        title: 'Edit User - MOVA Admin',
        layout: 'admin/layouts/main',
        user: { id: userId, ...req.body },
        errors: errors.array(),
        section: 'users'
      });
    }
    
    // Get current user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    // Check if username changed and already exists
    if (username !== user.username) {
      const [existingUsernames] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (existingUsernames.length > 0) {
        return res.render('admin/users/edit', {
          title: 'Edit User - MOVA Admin',
          layout: 'admin/layouts/main',
          user: { id: userId, ...req.body, profile_image: user.profile_image },
          errors: [{ msg: 'Username already in use' }],
          section: 'users'
        });
      }
    }
    
    // Check if email changed and already exists
    if (email !== user.email) {
      const [existingEmails] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingEmails.length > 0) {
        return res.render('admin/users/edit', {
          title: 'Edit User - MOVA Admin',
          layout: 'admin/layouts/main',
          user: { id: userId, ...req.body, profile_image: user.profile_image },
          errors: [{ msg: 'Email already in use' }],
          section: 'users'
        });
      }
    }
    
    // Process profile image upload
    let profileImage = user.profile_image;
    if (req.file) {
      profileImage = `/images/users/${req.file.filename}`;
      
      // Delete old image file if exists
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, '../../public', user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    // Set verification status
    const verificationStatus = is_verified === 'on' || is_verified === '1' ? 1 : 0;
    
    // Update user in database
    const [result] = await db.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, profile_image = ?, is_verified = ? WHERE id = ?',
      [username, email, full_name, profileImage, verificationStatus, userId]
    );
    
    req.session.successMessage = 'User updated successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error updating user:', error);
    req.session.errorMessage = 'Failed to update user: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
});

// Reset password form
router.get('/:id/reset-password', isAdminAuthenticated, logAdminActivity('view_reset_password'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    res.render('admin/users/reset-password', {
      title: `Reset Password: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      section: 'users'
    });
  } catch (error) {
    console.error('Error loading reset password form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load reset password form',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Process reset password
router.post('/:id/reset-password', isAdminAuthenticated, [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], logAdminActivity('reset_user_password'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user details
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).render('admin/error', {
          title: 'User Not Found',
          message: 'The user you requested could not be found',
          layout: 'admin/layouts/main',
          section: 'users'
        });
      }
      
      return res.render('admin/users/reset-password', {
        title: `Reset Password: ${user.username} - MOVA Admin`,
        layout: 'admin/layouts/main',
        user,
        errors: errors.array(),
        section: 'users'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password in database
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    req.session.successMessage = 'Password reset successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error resetting password:', error);
    req.session.errorMessage = 'Failed to reset password: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/reset-password`);
  }
});

// Toggle user verification status
router.get('/:id/toggle-verification', isAdminAuthenticated, logAdminActivity('toggle_user_verification'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    // Toggle verification status
    const newStatus = user.is_verified ? 0 : 1;
    
    // Update status in database
    const [result] = await db.execute(
      'UPDATE users SET is_verified = ? WHERE id = ?',
      [newStatus, userId]
    );
    
    req.session.successMessage = `User ${newStatus ? 'verified' : 'unverified'} successfully`;
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error toggling user verification status:', error);
    req.session.errorMessage = 'Failed to update user verification status: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}`);
  }
});

// Delete user confirmation
router.get('/:id/delete', isAdminAuthenticated, logAdminActivity('view_delete_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'users'
      });
    }
    
    res.render('admin/users/delete', {
      title: `Delete User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      section: 'users'
    });
  } catch (error) {
    console.error('Error loading delete user confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load delete user confirmation',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Delete user
router.post('/:id/delete', isAdminAuthenticated, logAdminActivity('delete_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { confirm } = req.body;
    
    // Confirm deletion
    if (confirm !== 'yes') {
      req.session.errorMessage = 'User deletion was not confirmed';
      return res.redirect(`/admin/users/${userId}/delete`);
    }
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.errorMessage = 'User not found or already deleted';
      return res.redirect('/admin/users');
    }
    
    // Delete profile image if exists
    if (user.profile_image) {
      const imagePath = path.join(__dirname, '../../public', user.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete user
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    req.session.successMessage = 'User deleted successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.session.errorMessage = 'Failed to delete user: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/delete`);
  }
});

// Filter users by verification status
router.get('/status/:status', isAdminAuthenticated, async (req, res) => {
  try {
    const { status } = req.params;
    
    // Redirect to the main users page with status filter
    res.redirect(`/admin/users?status=${status}`);
  } catch (error) {
    console.error('Error filtering users by status:', error);
    req.session.errorMessage = 'Failed to filter users';
    res.redirect('/admin/users');
  }
});

module.exports = router;