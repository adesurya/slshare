const User = require('../models/User');

// Authentication middleware for protected routes
const isAuthenticated = async (req, res, next) => {
  try {
    // Check if session exists
    if (req.session && req.session.userId) {
      // Get user from database
      const user = await User.findById(req.session.userId);
      
      if (user) {
        // User found, add to request object
        req.user = user;
        res.locals.user = {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          profile_image: user.profile_image,
          email: user.email,
          is_verified: user.is_verified
        };
        res.locals.isAuthenticated = true;
        return next();
      }
    }
    
    // No valid session, redirect to login
    res.locals.isAuthenticated = false;
    res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).render('error', {
      title: 'Authentication Error',
      message: 'There was a problem with authentication.'
    });
  }
};

// Check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/user/dashboard');
  }
  next();
};

// Set current user data if authenticated but don't redirect
// This middleware is used for public routes that need to know if a user is logged in
const setCurrentUser = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      
      if (user) {
        req.user = user;
        res.locals.user = {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          profile_image: user.profile_image,
          email: user.email,
          is_verified: user.is_verified
        };
        res.locals.isAuthenticated = true;
      } else {
        res.locals.isAuthenticated = false;
      }
    } else {
      res.locals.isAuthenticated = false;
    }
    next();
  } catch (error) {
    console.error('Error setting current user:', error);
    res.locals.isAuthenticated = false;
    next();
  }
};

// Middleware to check if email is verified
const requireEmailVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.redirect('/auth/verify-email');
  }
  next();
};

module.exports = {
  isAuthenticated,
  redirectIfAuthenticated,
  setCurrentUser,
  requireEmailVerified
};