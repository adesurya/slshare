// middlewares/viewDebug.js

/**
 * Middleware to debug view rendering
 */
function debugViews(req, res, next) {
    // Store the original render function
    const originalRender = res.render;
    
    // Override the render function
    res.render = function(view, options, callback) {
      // Log the view and options
      console.log(`Rendering view: ${view}`);
      console.log(`Layout: ${options.layout || res.locals.layout || 'default'}`);
      console.log(`Current page: ${options.currentPage || res.locals.currentPage || 'none'}`);
      
      // Call the original render function
      return originalRender.call(this, view, options, callback);
    };
    
    next();
  }
  
  module.exports = { debugViews };