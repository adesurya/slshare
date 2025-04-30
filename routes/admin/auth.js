// routes/admin/auth.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../../models/Admin');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../../config/database');
const crypto = require('crypto');

// Middleware untuk memeriksa autentikasi admin
const isAdminAuthenticated = (req, res, next) => {
  if (req.session.adminId) {
    // Set admin info for use in templates
    req.admin = {
      id: req.session.adminId,
      username: req.session.adminUsername,
      role: req.session.adminRole || 'admin'
    };
    return next();
  }
  
  // If not authenticated, redirect to login
  res.redirect('/admin/auth/login');
};

// Middleware untuk memeriksa jika user belum login
const isAdminGuest = (req, res, next) => {
  if (!req.session.adminId) {
    return next();
  }
  
  // If already authenticated, redirect to dashboard
  res.redirect('/admin/dashboard');
};

// Log admin activity
const logAdminActivity = (action) => {
  return (req, res, next) => {
    // Only log if admin is authenticated
    if (req.admin && req.admin.id) {
      // Capture any details you want to log
      const details = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      };
      
      // Add specific request details based on action
      if (req.params.id) {
        details.targetId = req.params.id;
      }
      
      // Log to database (async, don't wait for completion)
      Admin.logActivity(req.admin.id, action, details)
        .catch(err => console.error('Error logging admin activity:', err));
    }
    
    next();
  };
};

// Set current admin in res.locals
const setCurrentAdmin = (req, res, next) => {
  if (req.session.adminId) {
    res.locals.isAdminAuthenticated = true;
    res.locals.admin = {
      id: req.session.adminId,
      username: req.session.adminUsername,
      role: req.session.adminRole || 'admin'
    };
    
    // Set admin object for request
    req.admin = res.locals.admin;
  } else {
    res.locals.isAdminAuthenticated = false;
    res.locals.admin = null;
  }
  
  next();
};

// Admin login page
router.get('/login', isAdminGuest, (req, res) => {
  // Check if using the auth layout or not
  const useAuthLayout = true;
  
  const viewData = {
    title: 'Admin Login - MOVA',
    errorMessage: req.session.errorMessage,
    successMessage: req.session.successMessage
  };
  
  if (useAuthLayout) {
    // Clear session messages
    req.session.errorMessage = null;
    req.session.successMessage = null;
    
    res.render('admin/auth/login', {
      ...viewData,
      layout: 'admin/layouts/auth'
    });
  } else {
    // If auth layout is not set up, use standalone login page
    res.render('admin/auth/login-standalone', viewData);
  }
});

// Admin login processing
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple validation
    if (!username || !password) {
      req.session.errorMessage = 'Username and password are required';
      return res.redirect('/admin/auth/login');
    }
    
    // Try to find admin in the database first
    let admin;
    try {
      admin = await Admin.findByUsername(username);
    } catch (error) {
      console.error('Error looking up admin:', error);
      // Fallback to mock admin if database lookup fails
    }
    
    // If admin not found in database, check mock data (for development)
    if (!admin) {
      // Mock admin credentials (for testing purposes only)
      const adminUsers = [
        {
          id: 1,
          username: 'admin',
          password: '$2b$10$3dIlKs0jTQpCcQgZZDLISeIp/sF3OsrvMc6zO.ZFmvCOCjfzRzZhi', // 'password123'
          role: 'admin'
        }
      ];
      
      admin = adminUsers.find(u => u.username === username);
    }
    
    if (!admin) {
      req.session.errorMessage = 'Invalid username or password';
      return res.redirect('/admin/auth/login');
    }
    
    // Check password
    const match = await bcrypt.compare(password, admin.password);
    
    if (!match) {
      req.session.errorMessage = 'Invalid username or password';
      return res.redirect('/admin/auth/login');
    }
    
    // Set session
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    req.session.adminRole = admin.role;
    
    // Redirect to dashboard
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.session.errorMessage = 'An error occurred during login';
    res.redirect('/admin/auth/login');
  }
});

// Admin logout
router.get('/logout', isAdminAuthenticated, (req, res) => {
  try {
    // Clear admin session
    req.session.adminId = null;
    req.session.adminUsername = null;
    req.session.adminRole = null;
    
    // Set success message
    req.session.successMessage = 'You have been successfully logged out';
    
    // Destroy session and redirect
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/admin/auth/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/admin/dashboard');
  }
});

// Auto login (for development purposes only)
router.get('/auto-login', (req, res) => {
  // Only enable in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).send('Forbidden');
  }
  
  // Set admin session
  req.session.adminId = 1;
  req.session.adminUsername = 'admin';
  req.session.adminRole = 'admin';
  
  res.redirect('/admin/dashboard');
});

// Forgot password page
router.get('/forgot-password', isAdminGuest, (req, res) => {
  res.render('admin/auth/forgot-password', {
    title: 'Forgot Password - MOVA Admin',
    layout: 'admin/layouts/auth',
    successMessage: req.session.successMessage,
    errorMessage: req.session.errorMessage
  });
  req.session.successMessage = null;
  req.session.errorMessage = null;
});

// Process forgot password
router.post('/forgot-password', isAdminGuest, [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/auth/forgot-password', {
        title: 'Forgot Password - MOVA Admin',
        layout: 'admin/layouts/auth',
        errors: errors.array(),
        formData: req.body
      });
    }
    
    // Check if admin with this email exists
    const [admins] = await db.execute(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );
    
    // Always show success message even if email doesn't exist (security)
    req.session.successMessage = 'If your email exists in our system, you will receive password reset instructions';
    res.redirect('/admin/auth/forgot-password');
    
    // If admin exists, send reset email (implement email sending logic here)
    if (admins.length > 0) {
      const admin = admins[0];
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
      
      // Save token to database
      await db.execute(
        'UPDATE admin_users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, tokenExpiry, admin.id]
      );
      
      // Send email with reset link (implement your email sending logic here)
      // const resetLink = `${req.protocol}://${req.get('host')}/admin/auth/reset-password/${resetToken}`;
      
      console.log('Would send password reset email to:', email);
      // In a real app, you would send an actual email here
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    req.session.errorMessage = 'An error occurred. Please try again.';
    res.redirect('/admin/auth/forgot-password');
  }
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
    
    // Get current admin with password
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.render('admin/auth/change-password', {
        title: 'Change Password - MOVA Admin',
        layout: 'admin/layouts/main',
        errors: [{ msg: 'Admin account not found' }],
        section: 'profile'
      });
    }
    
    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, admin.password);
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

// Export middlewares for use in other routes and the router itself
module.exports = {
  router,
  isAdminAuthenticated,
  isAdminGuest,
  logAdminActivity,
  setCurrentAdmin
};