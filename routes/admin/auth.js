// routes/admin/auth.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../../models/Admin');
const { 
  redirectIfAdminAuthenticated, 
  isAdminAuthenticated,
  logAdminActivity 
} = require('../../middlewares/adminAuth');
const { v4: uuidv4 } = require('uuid');

// Admin login page
router.get('/login', redirectIfAdminAuthenticated, (req, res) => {
  res.render('admin/auth/login', { 
    title: 'Admin Login - MOVA',
    layout: 'admin/layouts/auth',
    errors: [],
    redirect: req.query.redirect || null
  });
});

// Admin login processing
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/auth/login', {
        title: 'Admin Login - MOVA',
        layout: 'admin/layouts/auth',
        errors: errors.array(),
        formData: req.body,
        redirect: req.body.redirect || null
      });
    }

    const { username, password, redirect } = req.body;
    
    // Find admin
    const admin = await Admin.findByUsername(username);
    
    if (!admin) {
      return res.render('admin/auth/login', {
        title: 'Admin Login - MOVA',
        layout: 'admin/layouts/auth',
        errors: [{ msg: 'Invalid username or password' }],
        formData: req.body,
        redirect: redirect || null
      });
    }
    
    // Verify password
    const isPasswordValid = await Admin.verifyPassword(password, admin.password);
    
    if (!isPasswordValid) {
      return res.render('admin/auth/login', {
        title: 'Admin Login - MOVA',
        layout: 'admin/layouts/auth',
        errors: [{ msg: 'Invalid username or password' }],
        formData: req.body,
        redirect: redirect || null
      });
    }
    
    // Create session
    req.session.adminId = admin.id;
    
    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 day from now
    
    await Admin.createSession(
      admin.id,
      sessionToken,
      req.headers['user-agent'] || 'Unknown',
      expiresAt
    );
    
    // Log activity
    await Admin.logActivity(admin.id, 'login', { ip: req.ip });
    
    // Redirect to original URL or dashboard
    if (redirect) {
      res.redirect(redirect);
    } else {
      res.redirect('/admin/dashboard');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('admin/auth/login', {
      title: 'Admin Login - MOVA',
      layout: 'admin/layouts/auth',
      errors: [{ msg: 'An error occurred during login' }],
      formData: req.body,
      redirect: req.body.redirect || null
    });
  }
});

// Admin logout
router.get('/logout', isAdminAuthenticated, logAdminActivity('logout'), (req, res) => {
  // Clear session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying admin session:', err);
    }
    res.redirect('/admin/login');
  });
});

// Change password page
router.get('/change-password', isAdminAuthenticated, (req, res) => {
  res.render('admin/auth/change-password', {
    title: 'Change Password - MOVA Admin',
    layout: 'admin/layouts/main',
    section: 'profile'
  });
});

// Process password change
router.post('/change-password', isAdminAuthenticated, [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], logAdminActivity('change_password'), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/auth/change-password', {
        title: 'Change Password - MOVA Admin',
        layout: 'admin/layouts/main',
        errors: errors.array(),
        section: 'profile'
      });
    }
    
    // Check current password
    const isCurrentPasswordValid = await Admin.verifyPassword(current_password, req.admin.password);
    if (!isCurrentPasswordValid) {
      return res.render('admin/auth/change-password', {
        title: 'Change Password - MOVA Admin',
        layout: 'admin/layouts/main',
        errors: [{ msg: 'Current password is incorrect' }],
        section: 'profile'
      });
    }
    
    // Change password
    await Admin.changePassword(req.admin.id, new_password);
    
    // Set success message
    req.session.successMessage = 'Password changed successfully';
    
    res.redirect('/admin/profile');
  } catch (error) {
    console.error('Admin password change error:', error);
    res.render('admin/auth/change-password', {
      title: 'Change Password - MOVA Admin',
      layout: 'admin/layouts/main',
      errors: [{ msg: 'An error occurred while changing password' }],
      section: 'profile'
    });
  }
});

// Admin profile page
router.get('/profile', isAdminAuthenticated, (req, res) => {
  const successMessage = req.session.successMessage;
  req.session.successMessage = null;
  
  res.render('admin/auth/profile', {
    title: 'My Profile - MOVA Admin',
    layout: 'admin/layouts/main',
    admin: req.admin,
    successMessage,
    section: 'profile'
  });
});

// Update admin profile
router.post('/profile', isAdminAuthenticated, [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
], logAdminActivity('update_profile'), async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/auth/profile', {
        title: 'My Profile - MOVA Admin',
        layout: 'admin/layouts/main',
        admin: req.admin,
        errors: errors.array(),
        section: 'profile'
      });
    }
    
    // Update profile
    await Admin.updateProfile(req.admin.id, { full_name, email });
    
    // Set success message
    req.session.successMessage = 'Profile updated successfully';
    
    res.redirect('/admin/profile');
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.render('admin/auth/profile', {
      title: 'My Profile - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      errors: [{ msg: 'An error occurred while updating profile' }],
      section: 'profile'
    });
  }
});

module.exports = router;