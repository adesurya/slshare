// middlewares/adminAuth.js
const Admin = require('../models/Admin');

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

// Middleware untuk memeriksa jika user belum login (guest)
const redirectIfAdminAuthenticated = (req, res, next) => {
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

// Set current admin and section based on URL
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
  
  // Tentukan section berdasarkan URL
  if (req.originalUrl.includes('/admin/dashboard')) {
    res.locals.section = 'dashboard';
  } else if (req.originalUrl.includes('/admin/products')) {
    res.locals.section = 'products';
  } else if (req.originalUrl.includes('/admin/brands')) {
    res.locals.section = 'brands';
  } else if (req.originalUrl.includes('/admin/orders')) {
    res.locals.section = 'orders';
  } else if (req.originalUrl.includes('/admin/users')) {
    res.locals.section = 'users';
  } else if (req.originalUrl.includes('/admin/transactions')) {
    res.locals.section = 'transactions';
  } else if (req.originalUrl.includes('/admin/profile')) {
    res.locals.section = 'profile';
  } else {
    res.locals.section = ''; // Default section kosong
  }
  
  next();
};

// Set default admin template variables
const setAdminTemplateDefaults = (req, res, next) => {
  // Pastikan section sesuai dengan path URL
  let urlPath = req.path;
  
  if (urlPath.startsWith('/admin/')) {
    urlPath = urlPath.substring(7); // Hapus '/admin/' dari path
    const mainSection = urlPath.split('/')[0]; // Ambil bagian pertama dari path
    
    // Set section berdasarkan bagian pertama dari path
    switch (mainSection) {
      case 'dashboard':
        res.locals.section = 'dashboard';
        break;
      case 'products':
        res.locals.section = 'products';
        break;
      case 'brands':
        res.locals.section = 'brands';
        break;
      case 'orders':
        res.locals.section = 'orders';
        break;
      case 'users':
        res.locals.section = 'users';
        break;
      case 'transactions':
        res.locals.section = 'transactions';
        break;
      case 'profile':
        res.locals.section = 'profile';
        break;
      default:
        res.locals.section = '';
    }
  }
  
  next();
};

module.exports = {
  isAdminAuthenticated,
  redirectIfAdminAuthenticated,
  logAdminActivity,
  setCurrentAdmin,
  setAdminTemplateDefaults
};