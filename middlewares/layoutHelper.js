// middlewares/layoutHelper.js

/**
 * Middleware to select the appropriate layout based on the request path
 */
function selectLayout(req, res, next) {
    // Default layout
    res.locals.layout = 'layout';
    
    // Get the path without the leading slash
    const path = req.path.substring(1);
    
    // Determine layout based on path
    if (path.startsWith('admin')) {
      res.locals.layout = 'layouts/main';
    } else if (path.startsWith('auth')) {
      // Use layout-with-container for authentication pages
      res.locals.layout = 'layout-with-container';
    }
    
    // Log the selected layout
    console.log(`Layout selected for path ${req.path}: ${res.locals.layout}`);
    
    next();
  }
  
  module.exports = { selectLayout };