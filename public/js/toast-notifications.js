// Toast notifications functionality

/**
 * Toast notification class for showing messages to the user
 */
class ToastNotification {
    /**
     * Create a new toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast: 'success', 'error', 'warning', or 'info'
     * @param {number} duration - Duration in milliseconds to show the toast
     */
    constructor(message, type = 'info', duration = 3000) {
      this.message = message;
      this.type = type;
      this.duration = duration;
      this.element = null;
      this.container = null;
      
      this.init();
    }
    
    /**
     * Initialize toast container if it doesn't exist
     */
    init() {
      // Create toast container if it doesn't exist
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      
      this.container = container;
    }
    
    /**
     * Show the toast notification
     */
    show() {
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast ${this.type}`;
      toast.innerHTML = `
        <span>${this.message}</span>
        <button class="toast-close">&times;</button>
      `;
      
      // Add to container
      this.container.appendChild(toast);
      this.element = toast;
      
      // Add click event to close button
      const closeButton = toast.querySelector('.toast-close');
      closeButton.addEventListener('click', () => this.close());
      
      // Auto-close after duration
      this.timeout = setTimeout(() => {
        this.close();
      }, this.duration);
    }
    
    /**
     * Close the toast notification
     */
    close() {
      if (this.element) {
        // Clear timeout to prevent duplicate calls
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        
        // Add fade out animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(-10px)';
        this.element.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Remove from DOM after animation
        setTimeout(() => {
          if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
          }
        }, 300);
      }
    }
  }
  
  /**
   * Show a success toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  function showSuccessToast(message, duration = 3000) {
    const toast = new ToastNotification(message, 'success', duration);
    toast.show();
    return toast;
  }
  
  /**
   * Show an error toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  function showErrorToast(message, duration = 4000) {
    const toast = new ToastNotification(message, 'error', duration);
    toast.show();
    return toast;
  }
  
  /**
   * Show a warning toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  function showWarningToast(message, duration = 3500) {
    const toast = new ToastNotification(message, 'warning', duration);
    toast.show();
    return toast;
  }
  
  /**
   * Show an info toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  function showInfoToast(message, duration = 3000) {
    const toast = new ToastNotification(message, 'info', duration);
    toast.show();
    return toast;
  }
  
  // Export toast functions
  window.toastNotifications = {
    success: showSuccessToast,
    error: showErrorToast,
    warning: showWarningToast,
    info: showInfoToast
  };
  
  // Add toast functionality to form submissions
  document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Check if it's a form that should show toast notifications
      if (form.classList.contains('use-toast')) {
        form.addEventListener('submit', function(e) {
          // Here we would normally only prevent default if there's a form validation error
          // For demonstration purposes, we'll just show a toast
          
          const formType = form.getAttribute('data-form-type');
          
          if (formType === 'login' || formType === 'register' || formType === 'withdraw') {
            // These forms should submit normally to the server
            // The server would then handle redirects and messages
          } else {
            // For other forms, prevent default and show a toast
            e.preventDefault();
            
            // Simulate form submission
            showInfoToast('Processing...');
            
            setTimeout(() => {
              // Simulate successful form submission
              showSuccessToast('Operation completed successfully!');
              
              // Optionally reset the form
              form.reset();
            }, 1500);
          }
        });
      }
    });
  });