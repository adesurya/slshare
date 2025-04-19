// desktop-view.js
// Enhances the desktop view experience

document.addEventListener('DOMContentLoaded', function() {
    // Detect if we're on desktop
    const isDesktop = window.innerWidth >= 768;
    
    if (isDesktop) {
      initDesktopEnhancements();
    }
    
    // Listen for window resize to handle responsive changes
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && !document.body.classList.contains('desktop-enhanced')) {
        initDesktopEnhancements();
      } else if (window.innerWidth < 768 && document.body.classList.contains('desktop-enhanced')) {
        // Remove desktop enhancements when going back to mobile
        document.body.classList.remove('desktop-enhanced');
      }
    });
    
    // Add mobile view to desktop preview
    populateMobilePreview();
  });
  
  /**
   * Initialize desktop-specific enhancements
   */
  function initDesktopEnhancements() {
    document.body.classList.add('desktop-enhanced');
    
    // Add smooth scroll to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    // Add animations for desktop features
    animateDesktopElements();
    
    // Add hover effects to feature cards
    addFeatureCardEffects();
  }
  
  /**
   * Populate the mobile preview inside the desktop view
   */
  function populateMobilePreview() {
    const mobilePreviewContainer = document.querySelector('.phone-screen .mobile-view');
    if (!mobilePreviewContainer) return;
    
    // Clone the current mobile view (without bottom navigation and app prompt)
    const mobileContent = document.querySelector('.mobile-view-container');
    if (mobileContent) {
      // Create a cloned, simplified version for the preview
      const clone = mobileContent.cloneNode(true);
      
      // Remove elements we don't want in the preview
      const elementsToRemove = [
        '#app-download-prompt',
        '.bottom-nav'
      ];
      
      elementsToRemove.forEach(selector => {
        const element = clone.querySelector(selector);
        if (element) element.remove();
      });
      
      // Add the cloned content to the preview
      mobilePreviewContainer.appendChild(clone);
      
      // Scale down the content to fit the phone mockup
      mobilePreviewContainer.style.transform = 'scale(0.75)';
      mobilePreviewContainer.style.transformOrigin = 'top center';
    }
  }
  
  /**
   * Add animations to desktop elements
   */
  function animateDesktopElements() {
    // Animate feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
    
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 100 * index);
    });
  }
  
  /**
   * Add hover effects to feature cards
   */
  function addFeatureCardEffects() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      });
    });
  }
  
  /**
   * Toggle between mobile and desktop views
   */
  function toggleViewMode() {
    const desktopContainer = document.querySelector('.desktop-container');
    const mobileViewContainer = document.querySelector('.mobile-view-container');
    
    if (desktopContainer.style.display === 'none') {
      desktopContainer.style.display = 'block';
      mobileViewContainer.style.maxWidth = '480px';
      mobileViewContainer.style.margin = '0 auto';
      mobileViewContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.1)';
      document.body.style.backgroundColor = '#f0f0f0';
    } else {
      desktopContainer.style.display = 'none';
      mobileViewContainer.style.maxWidth = 'none';
      mobileViewContainer.style.boxShadow = 'none';
      document.body.style.backgroundColor = '#fff';
    }
  }
  
  // Add a toggle button to switch between desktop and mobile views (for testing)
  function addViewToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle View Mode';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.zIndex = '9999';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.backgroundColor = '#ff0033';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    
    toggleButton.addEventListener('click', toggleViewMode);
    
    document.body.appendChild(toggleButton);
  }
  
  // Only add the toggle button in development environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    addViewToggle();
  }