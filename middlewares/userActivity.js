// middlewares/userActivity.js

const User = require('../models/User');

// Middleware to log user activities
const logUserActivity = (activityType) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.id) {
        // Get device information from user agent
        const deviceInfo = req.headers['user-agent'] || null;
        
        // Get IP address
        const ipAddress = 
          req.headers['x-forwarded-for'] || 
          req.connection.remoteAddress || 
          null;
        
        // Prepare activity description based on type
        let description = '';
        
        switch (activityType) {
          case 'login':
            description = 'User logged into the system';
            break;
          case 'logout':
            description = 'User logged out of the system';
            break;
          case 'password_change':
            description = 'User changed their password';
            break;
          case 'profile_update':
            description = 'User updated their profile';
            break;
          case 'order_placed':
            const orderId = req.body.order_id || req.params.order_id || 'unknown';
            description = `User placed a new order #${orderId}`;
            break;
          default:
            description = activityType || 'User performed an action';
        }
        
        // Log activity
        await User.logActivity(
          req.user.id,
          activityType,
          description,
          ipAddress,
          deviceInfo
        );
      }
    } catch (error) {
      console.error('Error logging user activity:', error);
      // Don't stop the request flow, just log the error
    }
    
    next();
  };
};

module.exports = {
  logUserActivity
};