// Main JavaScript file for MOVA web application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI components
    initUI();
    
    // Handle search form submission
    const searchForm = document.querySelector('.search-bar form');
    if (searchForm) {
      searchForm.addEventListener('submit', handleSearch);
    }
    
    // Handle bottom navigation active state
    const currentPage = document.body.dataset.currentPage;
    if (currentPage) {
      const activeNavItem = document.querySelector(`.nav-item[data-page="${currentPage}"]`);
      if (activeNavItem) {
        activeNavItem.classList.add('active');
      }
    }
  });
  
  /**
   * Initialize UI components
   */
  function initUI() {
    // Initialize sliders
    initSliders();
    
    // Initialize tabs
    initTabs();
    
    // Handle image lazy loading
    lazyLoadImages();
  }
  
  /**
   * Initialize sliders with horizontal scroll
   */
  function initSliders() {
    const sliders = document.querySelectorAll('.gifts-slider, .products-slider, .brand-products');
    
    sliders.forEach(slider => {
      let isDown = false;
      let startX;
      let scrollLeft;
      
      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
      });
      
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
      });
      
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        slider.scrollLeft = scrollLeft - walk;
      });
    });
  }
  
  /**
   * Initialize category tabs
   */
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        
        // Here you would typically load the content for the selected tab
        // loadTabContent(button.dataset.category);
      });
    });
  }
  
  /**
   * Handle search form submission
   * @param {Event} e - Form submit event
   */
  function handleSearch(e) {
    const searchInput = e.target.querySelector('input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
      e.preventDefault();
      searchInput.focus();
      return;
    }
    
    // Check if input is a Shopee or TikTok link
    if (isShopeeOrTikTokLink(searchTerm)) {
      // Handle link processing
      e.preventDefault();
      processShoppingLink(searchTerm);
    }
  }
  
  /**
   * Check if a string is a Shopee or TikTok product link
   * @param {string} link - URL to check
   * @returns {boolean} - True if it's a Shopee or TikTok link
   */
  function isShopeeOrTikTokLink(link) {
    return link.includes('shopee.') || link.includes('tiktok.') || link.includes('tokopedia.') || link.includes('lazada.');
  }
  
  /**
   * Process a shopping link from Shopee or TikTok
   * @param {string} link - Shopping product link
   */
  function processShoppingLink(link) {
    // Show loading indicator
    showLoadingIndicator();
    
    // Here you would typically send the link to your server for processing
    // and generate a cashback link
    
    // For demo purposes, simulate processing
    setTimeout(() => {
      hideLoadingIndicator();
      showProductPreview(link);
    }, 1500);
  }
  
  /**
   * Show loading indicator
   */
  function showLoadingIndicator() {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById('loading-overlay')) {
      const loadingHTML = `
        <div id="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Memproses link...</p>
        </div>
      `;
      
      const loadingElement = document.createElement('div');
      loadingElement.innerHTML = loadingHTML;
      document.body.appendChild(loadingElement.firstElementChild);
      
      // Add styles for loading overlay
      const style = document.createElement('style');
      style.textContent = `
        #loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          color: white;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.getElementById('loading-overlay').style.display = 'flex';
  }
  
  /**
   * Hide loading indicator
   */
  function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }
  
  /**
   * Show product preview after processing a link
   * @param {string} link - The original shopping link
   */
  function showProductPreview(link) {
    // For demo purposes, show mock product preview
    const previewHTML = `
      <div id="product-preview">
        <div class="preview-header">
          <h3>Link Berhasil Diproses</h3>
          <button id="close-preview">&times;</button>
        </div>
        <div class="preview-content">
          <div class="preview-image">
            <img src="/images/product-placeholder.jpg" alt="Product Preview">
          </div>
          <div class="preview-info">
            <h4>Product Name Example</h4>
            <div class="preview-price">Rp199.000</div>
            <div class="preview-cashback">
              <span>Est. Cashback:</span>
              <span class="cashback-amount">Rp19.900</span>
            </div>
          </div>
        </div>
        <div class="preview-buttons">
          <a href="#" class="copy-link-btn">Salin Link</a>
          <a href="${link}" class="continue-btn">Lanjutkan Belanja</a>
        </div>
      </div>
    `;
    
    // Create preview element if it doesn't exist
    if (!document.getElementById('product-preview')) {
      const previewElement = document.createElement('div');
      previewElement.innerHTML = previewHTML;
      document.body.appendChild(previewElement.firstElementChild);
      
      // Add styles for product preview
      const style = document.createElement('style');
      style.textContent = `
        #product-preview {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          z-index: 9999;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .preview-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        #close-preview {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        
        .preview-content {
          padding: 15px;
          display: flex;
          gap: 15px;
        }
        
        .preview-image {
          width: 80px;
          height: 80px;
          background-color: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .preview-info {
          flex: 1;
        }
        
        .preview-info h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
        }
        
        .preview-price {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .preview-cashback {
          font-size: 12px;
          color: #666;
        }
        
        .cashback-amount {
          color: #ff0033;
          font-weight: bold;
        }
        
        .preview-buttons {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid #eee;
        }
        
        .copy-link-btn, .continue-btn {
          flex: 1;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }
        
        .copy-link-btn {
          background-color: #f5f5f5;
        }
        
        .continue-btn {
          background-color: #ff0033;
          color: white;
        }
      `;
      document.head.appendChild(style);
      
      // Add event listeners for preview
      document.getElementById('close-preview').addEventListener('click', () => {
        document.getElementById('product-preview').style.display = 'none';
      });
      
      document.querySelector('.copy-link-btn').addEventListener('click', (e) => {
        e.preventDefault();
        // Simulate copying affiliate link to clipboard
        navigator.clipboard.writeText(`https://mova.app/go?url=${encodeURIComponent(link)}`).then(() => {
          alert('Link berhasil disalin!');
        });
      });
    } else {
      document.getElementById('product-preview').style.display = 'block';
    }
  }
  
  /**
   * Lazy load images when they come into view
   */
  function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver support
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }