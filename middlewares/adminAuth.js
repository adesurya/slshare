// middlewares/adminAuth.js
const Admin = require('../models/Admin');

// Authentication middleware for protected admin routes
const isAdminAuthenticated = async (req, res, next) => {
  try {
    // Check if admin session exists
    if (req.session && req.session.adminId) {
      // Get admin from database
      const admin = await Admin.findById(req.session.adminId);
      
      if (admin) {
        // Admin found, add to request object
        req.admin = admin;
        res.locals.admin = {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role
        };
        res.locals.isAdminAuthenticated = true;
        return next();
      }
    }
    
    // No valid session, redirect to admin login
    res.locals.isAdminAuthenticated = false;
    res.redirect('/admin/login?redirect=' + encodeURIComponent(req.originalUrl));
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).render('admin/error', {
      title: 'Authentication Error',
      message: 'There was a problem with authentication.'
    });
  }
};

// Check if admin is already logged in
const redirectIfAdminAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

// Set current admin data if authenticated but don't redirect
const setCurrentAdmin = async (req, res, next) => {
  try {
    if (req.session && req.session.adminId) {
      const admin = await Admin.findById(req.session.adminId);
      
      if (admin) {
        req.admin = admin;
        res.locals.admin = {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          email: admin.email,
          role: admin.role
        };
        res.locals.isAdminAuthenticated = true;
      } else {
        res.locals.isAdminAuthenticated = false;
      }
    } else {
      res.locals.isAdminAuthenticated = false;
    }
    next();
  } catch (error) {
    console.error('Error setting current admin:', error);
    res.locals.isAdminAuthenticated = false;
    next();
  }
};

// Middleware to check if admin has superadmin role
const requireSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    return next();
  }
  
  // Not a superadmin, show access denied
  res.status(403).render('admin/error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page. Only superadmins can access this feature.'
  });
};

// Log admin activity
const logAdminActivity = (action) => {
  return async (req, res, next) => {
    try {
      if (req.admin) {
        // Prepare details
        const details = {
          url: req.originalUrl,
          method: req.method,
          ip: req.ip
        };
        
        // Log activity
        await Admin.logActivity(req.admin.id, action, details);
      }
      next();
    } catch (error) {
      console.error('Error logging admin activity:', error);
      next();
    }
  };
};

module.exports = {
  isAdminAuthenticated,
  redirectIfAdminAuthenticated,
  setCurrentAdmin,
  requireSuperAdmin,
  logAdminActivity
};