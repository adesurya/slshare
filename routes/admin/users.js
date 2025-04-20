// routes/admin/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');

// Users list
router.get('/', isAdminAuthenticated, logAdminActivity('view_users'), async (req, res) => {
  try {
    // Get users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // This query would be in the User model
    const [rows] = await db.query(
      `SELECT * FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );
    
    // Count total users for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.render('admin/users/index', {
      title: 'Manage Users - MOVA Admin',
      layout: 'admin/layouts/main',
      users: rows,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages
      },
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
      message: 'Failed to load users list',
      layout: 'admin/layouts/main',
      section: 'users'
    });
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
        section: 'users'
      });
    }
    
    // Get user transactions
    const transactions = await Transaction.findByUserId(userId);
    
    // Get user's balance
    const balance = await Transaction.getBalance(userId);
    
    // Get user's wishlist
    const wishlist = await User.getWishlist(userId);
    
    res.render('admin/users/details', {
      title: `User: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      transactions,
      balance,
      wishlist,
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
      message: 'Failed to load user details',
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
router.post('/:id/edit', isAdminAuthenticated, [
  body('full_name').optional(),
  body('email').isEmail().withMessage('Please enter a valid email')
], logAdminActivity('update_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, email, is_verified } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user for re-rendering the form
      const user = await User.findById(userId);
      
      return res.render('admin/users/edit', {
        title: `Edit User: ${user.username} - MOVA Admin`,
        layout: 'admin/layouts/main',
        user,
        errors: errors.array(),
        section: 'users'
      });
    }
    
    // Update user profile
    await User.updateProfile(userId, {
      full_name,
      profile_image: user.profile_image // Keep existing image
    });
    
    // Update email if changed
    if (email !== user.email) {
      // This would be added to the User model
      await db.execute(
        'UPDATE users SET email = ? WHERE id = ?',
        [email, userId]
      );
    }
    
    // Update verification status if changed
    const verificationStatus = is_verified === 'on';
    if (verificationStatus !== user.is_verified) {
      await db.execute(
        'UPDATE users SET is_verified = ? WHERE id = ?',
        [verificationStatus, userId]
      );
    }
    
    req.session.successMessage = 'User updated successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error updating user:', error);
    req.session.errorMessage = 'Failed to update user';
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
    console.error('Error loading user delete confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user delete confirmation',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Delete user
router.post('/:id/delete', isAdminAuthenticated, logAdminActivity('delete_user'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // This would be added to the User model
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    if (result.affectedRows === 0) {
      req.session.errorMessage = 'User not found or already deleted';
    } else {
      req.session.successMessage = 'User deleted successfully';
    }
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    req.session.errorMessage = 'Failed to delete user';
    res.redirect(`/admin/users/${req.params.id}`);
  }
});

// Search users
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/users');
    }
    
    // Search users by username, email, or full name
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ? ORDER BY created_at DESC',
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    
    res.render('admin/users/search', {
      title: 'User Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      users,
      searchTerm: q,
      section: 'users'
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search users',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Add transaction form
router.get('/:id/add-transaction', isAdminAuthenticated, logAdminActivity('view_add_transaction'), async (req, res) => {
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
    
    res.render('admin/users/add-transaction', {
      title: `Add Transaction: ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      section: 'users'
    });
  } catch (error) {
    console.error('Error loading add transaction form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load add transaction form',
      layout: 'admin/layouts/main',
      section: 'users'
    });
  }
});

// Create transaction
router.post('/:id/add-transaction', isAdminAuthenticated, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['pending', 'successful']).withMessage('Invalid transaction type'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('add_transaction'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, type, description, reference_id } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user for re-rendering the form
      const user = await User.findById(userId);
      
      return res.render('admin/users/add-transaction', {
        title: `Add Transaction: ${user.username} - MOVA Admin`,
        layout: 'admin/layouts/main',
        user,
        errors: errors.array(),
        formData: req.body,
        section: 'users'
      });
    }
    
    // Create transaction
    await Transaction.create({
      user_id: userId,
      amount: parseFloat(amount),
      type,
      description,
      reference_id: reference_id || null
    });
    
    req.session.successMessage = 'Transaction added successfully';
    res.redirect(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error adding transaction:', error);
    req.session.errorMessage = 'Failed to add transaction';
    res.redirect(`/admin/users/${req.params.id}/add-transaction`);
  }
});

module.exports = router;