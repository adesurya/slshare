const express = require('express');
const router = express.Router();
const { isAuthenticated, requireEmailVerified } = require('../middlewares/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { Product } = require('../models/Product-brand-models');

// User dashboard - earnings overview (requires authentication and verified email)
router.get('/dashboard', isAuthenticated, requireEmailVerified, async (req, res) => {
  try {
    // Get user's earnings
    const earnings = await Transaction.getBalance(req.user.id);
    
    // Get top earners
    const topEarners = await Transaction.getTopEarners(5);
    
    // Get transaction history
    const transactions = await Transaction.findByUserId(req.user.id);
    
    res.render('user/dashboard', {
      title: 'Pendapatan - MOVA',
      earnings,
      topEarners,
      transactions,
      currentPage: 'earnings'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load dashboard',
      currentPage: ''
    });
  }
});

// User profile
router.get('/profile', isAuthenticated, async (req, res) => {
  res.render('user/profile', {
    title: 'Profil Saya - MOVA',
    user: req.user,
    currentPage: 'profile'
  });
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
      message: 'Failed to update profile',
      currentPage: 'profile'
    });
  }
});

// Withdraw earnings (requires authentication and verified email)
router.get('/withdraw', isAuthenticated, requireEmailVerified, async (req, res) => {
  try {
    // Get user's earnings
    const earnings = await Transaction.getBalance(req.user.id);
    
    // Get user's withdrawal methods
    const withdrawalMethods = []; // This would come from a model
    
    res.render('user/withdraw', {
      title: 'Tarik Dana - MOVA',
      earnings,
      withdrawalMethods,
      currentPage: 'earnings'
    });
  } catch (error) {
    console.error('Withdraw page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load withdraw page',
      currentPage: ''
    });
  }
});

// Process withdrawal (requires authentication and verified email)
router.post('/withdraw', isAuthenticated, requireEmailVerified, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Get user's earnings
    const earnings = await Transaction.getBalance(req.user.id);
    
    // Check if user has enough balance
    if (amount > earnings.successful) {
      return res.render('user/withdraw', {
        title: 'Tarik Dana - MOVA',
        earnings,
        withdrawalMethods: [], // This would come from a model
        errors: [{ msg: 'Insufficient balance' }],
        currentPage: 'earnings'
      });
    }
    
    // Create withdrawal transaction
    await Transaction.create({
      user_id: req.user.id,
      amount: -amount,
      type: 'successful',
      description: 'Withdrawal',
      reference_id: `WD-${Date.now()}`
    });
    
    res.redirect('/user/dashboard');
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to process withdrawal',
      currentPage: ''
    });
  }
});

// User wishlist (requires authentication)
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    // Get user's wishlist
    const products = await User.getWishlist(req.user.id);
    
    // Calculate cashback for each product
    for (let product of products) {
      product.cashback = await Product.calculateCashback(product.id);
    }
    
    res.render('user/wishlist', {
      title: 'My Wishlist - MOVA',
      products,
      currentPage: 'profile'
    });
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load wishlist',
      currentPage: ''
    });
  }
});

// Change password page
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('user/change-password', {
    title: 'Change Password - MOVA',
    currentPage: 'profile'
  });
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
      message: 'Failed to change password',
      currentPage: ''
    });
  }
});

module.exports = router;