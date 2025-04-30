const express = require('express');
const router = express.Router();
const { isAuthenticated, requireEmailVerified } = require('../middlewares/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Product } = require('../models/Product-brand-models');

// User dashboard - earnings overview (requires authentication and verified email)
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get user's earnings
    let earnings;
    try {
      earnings = await Transaction.getBalance(req.user.id);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      earnings = {
        total: 0,
        pending: 0,
        successful: 0
      };
    }
    
    // Get top earners
    let topEarners;
    try {
      topEarners = await Transaction.getTopEarners(5);
    } catch (err) {
      console.error('Error fetching top earners:', err);
      topEarners = [];
    }
    
    // Get transaction history
    let transactions;
    try {
      transactions = await Transaction.findByUserId(req.user.id);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      transactions = [];
    }
    
    console.log('Rendering dashboard with layout:', res.locals.layout);
    
    res.render('user/dashboard', {
      title: 'Pendapatan - MOVA',
      earnings,
      topEarners: topEarners || [],
      transactions: transactions || [],
      user: req.user,
      currentPage: 'earnings'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load dashboard: ' + error.message,
      currentPage: ''
    });
  }
});

// User profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    console.log('Rendering profile with layout:', res.locals.layout);
    
    res.render('user/profile', {
      title: 'Profil Saya - MOVA',
      user: req.user,
      currentPage: 'profile'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load profile: ' + error.message,
      currentPage: 'profile'
    });
  }
});

// Update profile
router.post('/profile', isAuthenticated, async (req, res) => {
  try {
    const { full_name, profile_image } = req.body;
    
    await User.updateProfile(req.user.id, {
      full_name,
      profile_image
    });
    
    // Redirect back to profile with success message
    req.session.successMessage = 'Profile updated successfully';
    res.redirect('/user/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to update profile: ' + error.message,
      currentPage: 'profile'
    });
  }
});

// Withdraw earnings (requires authentication)
router.get('/withdraw', isAuthenticated, async (req, res) => {
  try {
    // Get user's earnings
    let earnings;
    try {
      earnings = await Transaction.getBalance(req.user.id);
    } catch (err) {
      console.error('Error fetching earnings for withdraw page:', err);
      earnings = {
        total: 0,
        pending: 0,
        successful: 0
      };
    }
    
    console.log('Rendering withdraw page with layout:', res.locals.layout);
    
    res.render('user/withdraw', {
      title: 'Tarik Dana - MOVA',
      earnings,
      user: req.user,
      currentPage: 'earnings'
    });
  } catch (error) {
    console.error('Withdraw page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load withdraw page: ' + error.message,
      currentPage: ''
    });
  }
});

// Process withdrawal (requires authentication)
router.post('/withdraw', isAuthenticated, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Get user's earnings
    const earnings = await Transaction.getBalance(req.user.id);
    
    // Check if user has enough balance
    if (amount > earnings.successful) {
      return res.render('user/withdraw', {
        title: 'Tarik Dana - MOVA',
        earnings,
        user: req.user,
        withdrawalMethods: [], // This would come from a model
        errors: [{ msg: 'Insufficient balance' }],
        currentPage: 'earnings'
      });
    }
    
    // Create withdrawal transaction
    await Transaction.create({
      user_id: req.user.id,
      amount: -amount,
      transaction_type: 'withdrawal',
      status: 'pending',
      description: 'Withdrawal',
      reference_id: `WD-${Date.now()}`
    });
    
    res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to process withdrawal: ' + error.message,
      currentPage: ''
    });
  }
});

// User wishlist (requires authentication)
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    // Get user's wishlist
    let products;
    try {
      products = await User.getWishlist(req.user.id);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      products = [];
    }
    
    // Calculate cashback for each product
    if (products && products.length > 0) {
      for (let product of products) {
        try {
          product.cashback = await Product.calculateCashback(product.id);
        } catch (err) {
          console.warn(`Error calculating cashback for product ${product.id}:`, err);
          product.cashback = 0;
        }
      }
    }
    
    console.log('Rendering wishlist with layout:', res.locals.layout);
    
    res.render('user/wishlist', {
      title: 'My Wishlist - MOVA',
      products: products || [],
      user: req.user,
      currentPage: 'profile'
    });
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load wishlist: ' + error.message,
      currentPage: ''
    });
  }
});

// Change password page
router.get('/change-password', isAuthenticated, (req, res) => {
  try {
    console.log('Rendering change password page with layout:', res.locals.layout);
    
    res.render('user/change-password', {
      title: 'Change Password - MOVA',
      user: req.user,
      currentPage: 'profile'
    });
  } catch (error) {
    console.error('Change password page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load change password page: ' + error.message,
      currentPage: 'profile'
    });
  }
});

// Process password change
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    
    // Validate input
    const errors = [];
    
    if (!current_password) {
      errors.push({ msg: 'Current password is required' });
    }
    
    if (!new_password) {
      errors.push({ msg: 'New password is required' });
    } else if (new_password.length < 6) {
      errors.push({ msg: 'New password must be at least 6 characters' });
    }
    
    if (new_password !== confirm_password) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    // Check current password
    const isCurrentPasswordValid = await User.verifyPassword(current_password, req.user.password);
    if (!isCurrentPasswordValid) {
      errors.push({ msg: 'Current password is incorrect' });
    }
    
    if (errors.length > 0) {
      return res.render('user/change-password', {
        title: 'Change Password - MOVA',
        errors,
        user: req.user,
        currentPage: 'profile'
      });
    }
    
    // Change password
    await User.changePassword(req.user.id, new_password);
    
    // Redirect to profile with success message
    req.session.successMessage = 'Password changed successfully';
    res.redirect('/user/profile');
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to change password: ' + error.message,
      currentPage: ''
    });
  }
});

module.exports = router;