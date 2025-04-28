// routes/admin/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const UserBalance = require('../../models/UserBalance');
const { Order } = require('../../models/Order');
const Withdrawal = require('../../models/Withdrawal');
const db = require('../../config/database');
const bcrypt = require('bcrypt');

// Users list
router.get('/', isAdminAuthenticated, async (req, res) => {
  try {
    // Get users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Hindari penggunaan parameter untuk LIMIT dan OFFSET
    const [users] = await db.execute(`
      SELECT u.*, 
             COALESCE(b.available_balance, 0) as available_balance,
             COALESCE(b.pending_balance, 0) as pending_balance
      FROM users u
      LEFT JOIN user_balances b ON u.id = b.user_id
      ORDER BY u.id DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    
    // Hitung total users untuk pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Tambahkan stats untuk template
    const stats = {
      total_users: totalUsers
    };
    
    res.render('admin/users/index', {
      title: 'Users Management - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      users,
      stats,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages
      },
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading users list:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load users: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

router.get('/api/transaction-stats', isAdminAuthenticated, async (req, res) => {
  try {
    const [monthlyData] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus') AND status = 'completed' AND amount > 0 THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as withdrawals
      FROM user_transactions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%b %Y')
      ORDER BY MIN(created_at)
    `);
    
    const chartData = {
      labels: monthlyData.map(item => item.month),
      income: monthlyData.map(item => parseFloat(item.income || 0)),
      withdrawals: monthlyData.map(item => parseFloat(item.withdrawals || 0))
    };
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error refreshing transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh transaction stats'
    });
  }
});

router.get('/settings', isAdminAuthenticated, async (req, res) => {
  try {
    // Get system settings
    const [settings] = await db.execute('SELECT * FROM system_settings');
    
    res.render('admin/dashboard/settings', {
      title: 'System Settings - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'dashboard',
      subsection: 'settings',
      settings,
      breadcrumb: {
        current: 'System Settings'
      }
    });
  } catch (error) {
    console.error('Error loading settings page:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load settings page: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'dashboard'
    });
  }
});

router.post('/settings', isAdminAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      if (key.startsWith('setting_')) {
        const settingKey = key.replace('setting_', '');
        await db.execute(
          'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
          [value, settingKey]
        );
      }
    }
    
    req.session.successMessage = 'Settings updated successfully';
    res.redirect('/admin/dashboard/settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    req.session.errorMessage = 'Failed to update settings: ' + error.message;
    res.redirect('/admin/dashboard/settings');
  }
});

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
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Get user balance
    const balance = await UserBalance.findByUserId(userId);
    
    // Get user transactions
    const transactions = await Transaction.findByUserId(userId);
    
    // Get user orders
    const orders = await Order.findByUserId(userId, 5);
    
    // Get user withdrawals
    const withdrawals = await Withdrawal.findByUserId(userId, 5);
    
    // Get total statistics
    const [stats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM orders o
      WHERE o.user_id = ?
    `, [userId]);
    
    res.render('admin/users/details', {
      title: `User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      balance: balance || { available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 },
      transactions,
      orders,
      withdrawals,
      stats: stats[0],
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: user.username
      },
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
      admin: req.admin,
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
        admin: req.admin,
        section: 'users'
      });
    }
    
    res.render('admin/users/edit', {
      title: `Edit User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: `Edit ${user.username}`
      }
    });
  } catch (error) {
    console.error('Error loading user edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user edit form: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Fetch user data
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Fetch user statistics (using the improved method)
    const stats = await User.getUserStats(userId);
    
    // Fetch orders with proper error handling
    let orders = [];
    try {
      orders = await User.getUserOrders(userId, 5, 0);
    } catch (orderError) {
      console.error('Error fetching orders:', orderError);
      // Don't return an error, just continue with empty orders array
    }
    
    // Fetch transactions if you have them
    let transactions = [];
    try {
      // If you have a method for this, use it
      // transactions = await Transaction.getByUserId(userId, 5, 0);
    } catch (transactionError) {
      console.error('Error fetching transactions:', transactionError);
    }
    
    // Render the page with all available data
    res.render('admin/users/details', {
      title: `User Details - ${user.username}`,
      section: 'users',
      user,
      orders: orders || [],
      transactions: transactions || [],
      stats,
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: user.username
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    req.flash('error', 'Error fetching user details');
    res.redirect('/admin/users');
  }
});

// Update user
router.post('/:id/edit', isAdminAuthenticated, [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], logAdminActivity('update_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email, password, is_verified } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user for re-rendering
      const user = await User.findById(userId);
      
      return res.render('admin/users/edit', {
        title: `Edit User - MOVA Admin`,
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users',
        user: { ...user, ...req.body },
        errors: errors.array(),
        breadcrumb: {
          parent: 'Users',
          parentUrl: '/admin/users',
          current: `Edit ${user.username}`
        }
      });
    }
    
    // Get current user
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/admin/users');
    }
    
    // Check if email is already used by another user
    if (email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id != userId) {
        // Get user for re-rendering
        return res.render('admin/users/edit', {
          title: `Edit User - MOVA Admin`,
          layout: 'admin/layouts/main',
          admin: req.admin,
          section: 'users',
          user: { ...user, ...req.body },
          errors: [{ msg: 'Email is already in use by another user' }],
          breadcrumb: {
            parent: 'Users',
            parentUrl: '/admin/users',
            current: `Edit ${user.username}`
          }
        });
      }
    }
    
    // Update user in database
    let updateQuery = 'UPDATE users SET full_name = ?, email = ?, is_verified = ? WHERE id = ?';
    let queryParams = [full_name, email, is_verified ? 1 : 0, userId];
    
    // If password is provided, hash it and include in update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = 'UPDATE users SET full_name = ?, email = ?, is_verified = ?, password = ? WHERE id = ?';
      queryParams = [full_name, email, is_verified ? 1 : 0, hashedPassword, userId];
    }
    
    await db.execute(updateQuery, queryParams);
    
    req.session.successMessage = 'User updated successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error updating user:', error);
    req.session.errorMessage = 'Failed to update user: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/edit`);
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
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Count related data
    const [counts] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE user_id = ?) as order_count,
        (SELECT COUNT(*) FROM user_transactions WHERE user_id = ?) as transaction_count,
        (SELECT COUNT(*) FROM user_withdrawals WHERE user_id = ?) as withdrawal_count
    `, [userId, userId, userId]);
    
    res.render('admin/users/delete', {
      title: `Delete User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      counts: counts[0],
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: `Delete ${user.username}`
      }
    });
  } catch (error) {
    console.error('Error loading user delete confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user delete confirmation: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
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
    
    // Delete user
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    req.session.successMessage = 'User deleted successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.session.errorMessage = 'Failed to delete user: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/delete`);
  }
});

// Create user form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_user'), (req, res) => {
  res.render('admin/users/new', {
    title: 'Add New User - MOVA Admin',
    layout: 'admin/layouts/main',
    admin: req.admin,
    section: 'users',
    breadcrumb: {
      parent: 'Users',
      parentUrl: '/admin/users',
      current: 'Add New User'
    }
  });
});

// Create user
router.post('/new', isAdminAuthenticated, [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required')
], logAdminActivity('create_user'), async (req, res) => {
  try {
    const { username, email, password, full_name, is_verified } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/users/new', {
        title: 'Add New User - MOVA Admin',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users',
        formData: req.body,
        errors: errors.array(),
        breadcrumb: {
          parent: 'Users',
          parentUrl: '/admin/users',
          current: 'Add New User'
        }
      });
    }
    
    // Check if username or email already exists
    const existingUser = await User.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.render('admin/users/new', {
        title: 'Add New User - MOVA Admin',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users',
        formData: req.body,
        errors: [{ msg: 'Username or email already exists' }],
        breadcrumb: {
          parent: 'Users',
          parentUrl: '/admin/users',
          current: 'Add New User'
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, is_verified) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, is_verified ? 1 : 0]
    );
    
    // Initialize user balance
    await UserBalance.initialize(result.insertId);
    
    req.session.successMessage = 'User created successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).render('admin/users/new', {
      title: 'Add New User - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      formData: req.body,
      errors: [{ msg: 'Failed to create user: ' + error.message }],
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: 'Add New User'
      }
    });
  }
});

// Search users
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/users');
    }
    
    // Search users
    const [users] = await db.execute(
      `SELECT u.*, 
             COALESCE(b.available_balance, 0) as available_balance,
             COALESCE(b.pending_balance, 0) as pending_balance
      FROM users u
      LEFT JOIN user_balances b ON u.id = b.user_id
      WHERE u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?
      ORDER BY u.id ASC
      LIMIT 50`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    
    res.render('admin/users/search', {
      title: 'User Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      users,
      searchTerm: q,
      breadcrumb: {
        parent: 'Users',
        parentUrl: '/admin/users',
        current: 'Search Results'
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search users: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

// View user orders
router.get('/:id/orders', isAdminAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Get user orders with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get orders
    const orders = await Order.findByUserId(userId, limit, offset);
    
    // Count total orders for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]);
    const totalOrders = countResult[0].count;
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.render('admin/users/orders', {
      title: `Orders for ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages
      },
      breadcrumb: {
        parent: user.username,
        parentUrl: `/admin/users/${userId}`,
        current: 'Orders'
      }
    });
  } catch (error) {
    console.error('Error loading user orders:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user orders: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

// View user transactions
router.get('/:id/transactions', isAdminAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Get user transactions with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get transactions
    const [transactions] = await db.execute(
      `SELECT * FROM user_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // Count total transactions for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM user_transactions WHERE user_id = ?', [userId]);
    const totalTransactions = countResult[0].count;
    const totalPages = Math.ceil(totalTransactions / limit);
    
    // Get user balance
    const balance = await UserBalance.findByUserId(userId);
    
    res.render('admin/users/transactions', {
      title: `Transactions for ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      transactions,
      balance: balance || { available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 },
      pagination: {
        page,
        limit,
        totalTransactions,
        totalPages
      },
      breadcrumb: {
        parent: user.username,
        parentUrl: `/admin/users/${userId}`,
        current: 'Transactions'
      }
    });
  } catch (error) {
    console.error('Error loading user transactions:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user transactions: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

// View user withdrawals
router.get('/:id/withdrawals', isAdminAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Get user withdrawals with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get withdrawals
    const withdrawals = await Withdrawal.findByUserId(userId, limit, offset);
    
    // Count total withdrawals for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM user_withdrawals WHERE user_id = ?', [userId]);
    const totalWithdrawals = countResult[0].count;
    const totalPages = Math.ceil(totalWithdrawals / limit);
    
    // Get user withdrawal methods
    const [methods] = await db.execute(
      `SELECT * FROM user_withdrawal_methods WHERE user_id = ?`,
      [userId]
    );
    
    res.render('admin/users/withdrawals', {
      title: `Withdrawals for ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      withdrawals,
      methods,
      pagination: {
        page,
        limit,
        totalWithdrawals,
        totalPages
      },
      breadcrumb: {
        parent: user.username,
        parentUrl: `/admin/users/${userId}`,
        current: 'Withdrawals'
      }
    });
  } catch (error) {
    console.error('Error loading user withdrawals:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user withdrawals: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

// Adjust user balance form
router.get('/:id/adjust-balance', isAdminAuthenticated, logAdminActivity('view_adjust_balance'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('admin/error', {
        title: 'User Not Found',
        message: 'The user you requested could not be found',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users'
      });
    }
    
    // Get user balance
    const balance = await UserBalance.findByUserId(userId);
    
    res.render('admin/users/adjust-balance', {
      title: `Adjust Balance for ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users',
      user,
      balance: balance || { available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 },
      breadcrumb: {
        parent: user.username,
        parentUrl: `/admin/users/${userId}`,
        current: 'Adjust Balance'
      }
    });
  } catch (error) {
    console.error('Error loading balance adjustment form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load balance adjustment form: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'users'
    });
  }
});

// Process balance adjustment
router.post('/:id/adjust-balance', isAdminAuthenticated, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('adjustment_type').isIn(['add', 'subtract']).withMessage('Invalid adjustment type'),
  body('balance_type').isIn(['available', 'pending']).withMessage('Invalid balance type'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('adjust_balance'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, adjustment_type, balance_type, description } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user and balance for re-rendering
      const user = await User.findById(userId);
      const balance = await UserBalance.findByUserId(userId);
      
      return res.render('admin/users/adjust-balance', {
        title: `Adjust Balance for ${user.username} - MOVA Admin`,
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'users',
        user,
        balance: balance || { available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 },
        formData: req.body,
        errors: errors.array(),
        breadcrumb: {
          parent: user.username,
          parentUrl: `/admin/users/${userId}`,
          current: 'Adjust Balance'
        }
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/admin/users');
    }
    
    // Determine the actual amount (positive or negative)
    let adjustmentAmount = parseFloat(amount);
    if (adjustment_type === 'subtract') {
      adjustmentAmount = -adjustmentAmount;
    }
    
    // Create an adjustment transaction
    await Transaction.create({
      user_id: parseInt(userId),
      amount: adjustmentAmount,
      transaction_type: 'adjustment',
      status: 'completed',
      description: `Manual balance adjustment by admin: ${description}`
    });
    
    // Update user balance directly
    if (balance_type === 'available') {
      await UserBalance.updateAvailableBalance(userId, adjustmentAmount);
    } else {
      await UserBalance.updatePendingBalance(userId, adjustmentAmount);
    }
    
    req.session.successMessage = `Balance ${adjustment_type === 'add' ? 'increased' : 'decreased'} by ${amount} successfully`;
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error adjusting balance:', error);
    req.session.errorMessage = 'Failed to adjust balance: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}/adjust-balance`);
  }
});

// Verify user
router.post('/:id/verify', isAdminAuthenticated, logAdminActivity('verify_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Update user verification status
    await db.execute('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
    
    req.session.successMessage = 'User verified successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error verifying user:', error);
    req.session.errorMessage = 'Failed to verify user: ' + error.message;
    res.redirect(`/admin/users/${req.params.id}`);
  }
});

module.exports = router;