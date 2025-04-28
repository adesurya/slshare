// MOVA Web Application - Enhanced JavaScript File

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI components
  initUI();
  
  // Initialize MOVA enhanced components
  initializeHeroCarousel();
  initializeProductCards();
  initializeBottomNav();
  initializeGiftItems();
  fixMissingImages();
  
  // Initialize infinite scroll
  initInfiniteScroll();
  
  // Initialize scroll to top button
  initScrollToTop();
  
  // Initialize category tabs and sorting
  initCategoryTabs();
  initSorting();

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
  
  // Handle app download prompt
  const appPrompt = document.getElementById('app-download-prompt');
  const closeBtn = document.getElementById('close-prompt');
  
  if (appPrompt && closeBtn) {
    closeBtn.addEventListener('click', function() {
      appPrompt.style.display = 'none';
      
      // Set cookie to hide the prompt
      fetch('/hide-app-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });
  }
  
  // Desktop download indicator
  const downloadIndicator = document.querySelector('.download-indicator');
  const downloadPopup = document.querySelector('.download-popup');
  
  if (downloadIndicator && downloadPopup) {
    downloadIndicator.addEventListener('click', function() {
      if (downloadPopup.style.display === 'block') {
        downloadPopup.style.display = 'none';
      } else {
        downloadPopup.style.display = 'block';
      }
    });
    
    // Close popup when clicking elsewhere
    document.addEventListener('click', function(e) {
      if (!downloadIndicator.contains(e.target) && !downloadPopup.contains(e.target)) {
        downloadPopup.style.display = 'none';
      }
    });
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
  
  if (tabButtons.length === 0) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Handle any category-specific content visibility
      // Normally would fetch products for this category, but we'll simulate
      const categoryName = this.textContent.trim();
      
      // Add visual feedback for loading
      const productCards = document.querySelectorAll('.product-card');
      if (productCards.length > 0) {
        productCards.forEach(card => {
          card.style.opacity = '0.7';
          card.style.transform = 'scale(0.98)';
        });
        
        setTimeout(() => {
          productCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        }, 300);
      }
      
      // Show 'loading' toast notification
      showToast(`Loading ${categoryName} products...`);
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

/**
 * Enhanced Infinite Scroll Implementation
 */
function initInfiniteScroll() {
  const productContainer = document.querySelector('.category-products');
  
  // If no product container exists on the page, exit
  if (!productContainer) return;
  
  // Get loading indicator
  const loadingIndicator = document.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none'; // Hide initially
  }
  
  // State variables for pagination
  let isLoading = false;
  let offset = 10; // Start from 10 since we initially load 10 products
  const limit = 10; // Load 10 more products each time
  let hasMoreProducts = true; // Assume there are more products initially
  
  // Current sort settings
  let currentSort = {
    field: 'created_at',
    order: 'DESC'
  };
  
  // Current category filter
  let currentCategory = '';
  
  // Function to check if user has scrolled to the bottom of the page
  function isNearBottom() {
    return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500);
  }
  
  // Function to load more products
  async function loadMoreProducts() {
    if (isLoading || !hasMoreProducts) return;
    
    isLoading = true;
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
    
    try {
      // Build the API URL with parameters
      const url = new URL('/api/products', window.location.origin);
      
      // Add query parameters
      url.searchParams.append('limit', limit);
      url.searchParams.append('offset', offset);
      url.searchParams.append('sortField', currentSort.field);
      url.searchParams.append('sortOrder', currentSort.order);
      
      // Add category if specified
      if (currentCategory) {
        url.searchParams.append('category', currentCategory);
      }
      
      // Fetch more products from API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const { products, hasMore } = data.data;
        
        // Update state
        hasMoreProducts = hasMore;
        offset += products.length;
        
        // If no more products or empty response, hide loading indicator
        if (!hasMore || products.length === 0) {
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }
          
          // If there are no products at all, show empty state
          if (offset === 10 && products.length === 0) {
            showEmptyState(productContainer);
          }
          
          // Add end of catalog message if we've loaded some products before
          if (offset > 10 && !document.querySelector('.end-catalog-message')) {
            addEndOfCatalogMessage();
          }
        } else {
          // Reset loading state
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }
        }
        
        // Append products to container
        if (products.length > 0) {
          appendProducts(productContainer, products);
        }
      } else {
        console.error('Failed to load more products:', data.message);
        showLoadingError();
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      showLoadingError();
    } finally {
      isLoading = false;
    }
  }
  
  // Function to show loading error
  function showLoadingError() {
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `
        <p>Gagal memuat produk. <button class="retry-button">Coba lagi</button></p>
      `;
      
      // Add retry button functionality
      const retryButton = loadingIndicator.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', function() {
          // Reset loading indicator
          loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Memuat lebih banyak produk...</p>
          `;
          
          // Try loading again
          loadMoreProducts();
        });
      }
    }
  }
  
  // Function to append new products to the container
  function appendProducts(container, products) {
    products.forEach(product => {
      // Create product card element
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      
      // Calculate cashback percentage
      let cashbackPercentage = '10%';
      if (product.price && product.cashback) {
        const percent = Math.round((product.cashback / product.price) * 100);
        if (percent > 0 && percent < 100) {
          cashbackPercentage = `${percent}%`;
        }
      }
      
      // Format numbers with thousand separator
      const formattedPrice = formatNumber(product.price);
      const formattedCashback = formatNumber(product.cashback);
      
      // Set product card HTML
      productCard.innerHTML = `
        <a href="/products/${product.id}">
          <!-- Image Container -->
          <div class="product-image">
            <img src="${product.image_url || '/images/product-placeholder.jpg'}" alt="${product.name}" loading="lazy">
            <div class="cashback-badge">${cashbackPercentage} Cashback</div>
          </div>
          
          <!-- Info Container -->
          <div class="product-info">
            <!-- Product Name -->
            <h3 class="product-name" title="${product.name}">${product.name}</h3>
            
            <!-- Price -->
            <div class="product-price" data-price="${product.price}">Rp${formattedPrice}</div>
            
            <!-- Cashback -->
            <div class="product-cashback">
              <span class="cashback-label">Est. Cashback</span>
              <span class="cashback-amount" data-cashback="${product.cashback}">Rp${formattedCashback}</span>
            </div>
          </div>
        </a>
      `;
      
      // Add to container
      container.appendChild(productCard);
    });
    
    // After adding new products, re-run card fixes
    fixProductCards();
  }
  
  // Function to display empty state
  function showEmptyState(container) {
    if (container.querySelectorAll('.product-card').length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada produk yang ditemukan</p>
        </div>
      `;
    }
  }
  
  // Function to add "End of catalog" message
  function addEndOfCatalogMessage() {
    const endMessage = document.createElement('div');
    endMessage.className = 'end-catalog-message';
    endMessage.innerHTML = '<p>Anda telah mencapai akhir dari katalog kami</p>';
    
    // Add after the loading indicator
    if (loadingIndicator) {
      loadingIndicator.parentNode.insertBefore(endMessage, loadingIndicator);
    } else {
      // If no loading indicator, append to product container's parent
      const parent = document.querySelector('.category-products').parentNode;
      parent.appendChild(endMessage);
    }
  }
  
  // Set up sorting functionality
  window.updateProductSort = function(sortOption) {
    // Reset state for new sort
    offset = 0;
    hasMoreProducts = true;
    
    // Clear existing products
    productContainer.innerHTML = '';
    
    // Show loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
    
    // Remove existing end catalog message if any
    const endMessage = document.querySelector('.end-catalog-message');
    if (endMessage) {
      endMessage.remove();
    }
    
    // Update sort parameters based on selection
    switch (sortOption) {
      case 'newest':
        currentSort = { field: 'created_at', order: 'DESC' };
        break;
      case 'price-low':
        currentSort = { field: 'price', order: 'ASC' };
        break;
      case 'price-high':
        currentSort = { field: 'price', order: 'DESC' };
        break;
      case 'cashback':
        currentSort = { field: 'cashback_percentage', order: 'DESC' };
        break;
      default:
        currentSort = { field: 'created_at', order: 'DESC' };
    }
    
    // Load products with new sort
    loadMoreProducts();
  };
  
  // Set up category filtering
  window.filterByCategory = function(category) {
    // Reset state for new filter
    offset = 0;
    hasMoreProducts = true;
    currentCategory = category;
    
    // Clear existing products
    productContainer.innerHTML = '';
    
    // Show loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
    
    // Remove existing end catalog message if any
    const endMessage = document.querySelector('.end-catalog-message');
    if (endMessage) {
      endMessage.remove();
    }
    
    // Load products with new filter
    loadMoreProducts();
  };
  
  // Make loadMoreProducts available globally for other functions to use
  window.loadMoreProducts = loadMoreProducts;
  
  // Add scroll event listener with debounce
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (isNearBottom() && !isLoading && hasMoreProducts) {
        loadMoreProducts();
      }
      
      // Update scroll to top button visibility if function exists
      if (typeof updateScrollToTopButton === 'function') {
        updateScrollToTopButton();
      }
    }, 100);
  });
  
  // Also check on page load if we need to load more
  // This is helpful for cases where the initial content doesn't fill the page
  if (isNearBottom() && hasMoreProducts) {
    loadMoreProducts();
  }
}

/**
 * Initialize scroll to top button
 */
function initScrollToTop() {
  const scrollToTopBtn = document.querySelector('.scroll-to-top');
  
  if (!scrollToTopBtn) return;
  
  // Show button when user scrolls down
  window.updateScrollToTopButton = function() {
    if (window.scrollY > 500) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  };
  
  // Scroll to top when button is clicked
  scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Initialize category tabs for filtering
 */
function initCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active tab
      tabButtons.forEach(tab => tab.classList.remove('active'));
      this.classList.add('active');
      
      // Get category value
      const category = this.textContent === 'For You' ? '' : this.textContent.trim();
      
      // Update products section title
      const sectionTitle = document.querySelector('.products-section-title');
      if (sectionTitle) {
        sectionTitle.textContent = category || 'Produk Terbaru';
      }
      
      // Filter products by category (using the global filterByCategory function)
      if (typeof window.filterByCategory === 'function') {
        window.filterByCategory(category);
      }
    });
  });
}

/**
 * Initialize product sorting
 */
function initSorting() {
  const sortSelect = document.getElementById('product-sort');
  
  if (!sortSelect) return;
  
  sortSelect.addEventListener('change', function() {
    const sortOption = this.value;
    
    // Update products based on sort option (using the global updateProductSort function)
    if (typeof window.updateProductSort === 'function') {
      window.updateProductSort(sortOption);
    }
  });
}

// MOVA Enhanced Features

/**
 * Hero Carousel Setup - Creates an interactive carousel in the hero section
 */
function initializeHeroCarousel() {
  const heroSection = document.querySelector('.hero-section');
  
  if (!heroSection) return;
  
  // Create carousel container
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'hero-carousel';
  
  // Get the current hero content
  const currentHeroContent = heroSection.querySelector('.hero-content');
  
  if (!currentHeroContent) return;
  
  // Create copies with different content for the carousel
  const slides = [
    currentHeroContent,
    createHeroSlide('Hemat Lebih Banyak', 'Rp250.000', 'setiap pembelian', 'Gunakan kode promo MOVA25 >>>'),
    createHeroSlide('Cashback Spesial', 'Rp50.000', 'di semua kategori', 'Hingga 31 April 2025 >>>')
  ];
  
  // Append slides to the carousel
  slides.forEach(slide => {
    const slideWrapper = document.createElement('div');
    slideWrapper.className = 'hero-slide';
    slideWrapper.appendChild(slide.cloneNode(true));
    carouselContainer.appendChild(slideWrapper);
  });
  
  // Replace original content with carousel
  heroSection.innerHTML = '';
  heroSection.appendChild(carouselContainer);
  
  // Add indicators
  const indicators = document.createElement('div');
  indicators.className = 'hero-indicators';
  
  for (let i = 0; i < slides.length; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'hero-indicator' + (i === 0 ? ' active' : '');
    indicator.dataset.slide = i;
    indicator.addEventListener('click', () => {
      showSlide(i);
    });
    indicators.appendChild(indicator);
  }
  
  heroSection.appendChild(indicators);
  
  // Add navigation arrows
  const navContainer = document.createElement('div');
  navContainer.className = 'hero-nav';
  
  const prevButton = document.createElement('div');
  prevButton.className = 'hero-nav-button prev';
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.addEventListener('click', () => {
    showSlide(currentSlide - 1);
  });
  
  const nextButton = document.createElement('div');
  nextButton.className = 'hero-nav-button next';
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextButton.addEventListener('click', () => {
    showSlide(currentSlide + 1);
  });
  
  navContainer.appendChild(prevButton);
  navContainer.appendChild(nextButton);
  heroSection.appendChild(navContainer);
  
  // Initialize carousel
  const slideElements = carouselContainer.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  
  // Set initial state
  updateCarousel();
  
  // Start auto-rotation
  let carouselInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
  
  // Function to show a specific slide
  function showSlide(index) {
    // Handle wrap-around
    if (index < 0) {
      index = slideElements.length - 1;
    } else if (index >= slideElements.length) {
      index = 0;
    }
    
    currentSlide = index;
    updateCarousel();
    
    // Reset interval
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }
  // Update carousel display
  function updateCarousel() {
    // Update slide positions
    slideElements.forEach((slide, i) => {
      slide.style.display = i === currentSlide ? 'block' : 'none';
    });
    
    // Update indicators
    const indicatorElements = indicators.querySelectorAll('.hero-indicator');
    indicatorElements.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentSlide);
    });
  }

  // Create a new hero slide
  function createHeroSlide(title, amount, subtitle, description) {
    const slideContent = document.createElement('div');
    slideContent.className = 'hero-content';
    
    slideContent.innerHTML = `
      <h1 class="hero-title">${title}</h1>
      <div class="hero-amount">${amount}</div>
      <h2 class="hero-subtitle">${subtitle}</h2>
      <p class="hero-description">${description}</p>
    `;
    
    return slideContent;
  }
}

/**
 * Product Card Interactions - Enhances product cards with effects and badges
 */
function initializeProductCards() {
  const productCards = document.querySelectorAll('.product-card');
  
  if (productCards.length === 0) return;
  
  productCards.forEach(card => {
    // Add cashback badge if not exists
    if (!card.querySelector('.cashback-badge')) {
      const imageContainer = card.querySelector('.product-image');
      
      if (imageContainer) {
        const cashbackBadge = document.createElement('div');
        cashbackBadge.className = 'cashback-badge';
        
        // Get random cashback percentage for demo
        const percentage = Math.floor(Math.random() * 10) + 5;
        cashbackBadge.textContent = `${percentage}% Cashback`;
        
        imageContainer.appendChild(cashbackBadge);
      }
    }
    
    // Make sure all product cards have consistent height
    equalizeProductCardHeights();
  });
}

/**
 * Function to fix alignment of product cards
 */
function equalizeProductCardHeights() {
  // Wait for images to load to get proper heights
  window.addEventListener('load', () => {
    const rows = {};
    const cards = document.querySelectorAll('.product-card');
    
    // Group cards by their top position (row)
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const top = Math.floor(rect.top);
      
      if (!rows[top]) {
        rows[top] = [];
      }
      
      rows[top].push(card);
    });
    
    // For each row, set the same height
    Object.values(rows).forEach(rowCards => {
      let maxHeight = 0;
      
      // Find max natural height
      rowCards.forEach(card => {
        card.style.height = 'auto';
        const height = card.offsetHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      });
      
      // Apply max height to all cards in the row
      rowCards.forEach(card => {
        card.style.height = `${maxHeight}px`;
      });
    });
  });
}

/**
 * Bottom Navigation Fix - Enhances bottom navigation with ripple effects
 */
function initializeBottomNav() {
  const bottomNav = document.querySelector('.bottom-nav');
  const mainContent = document.querySelector('.main-content');
  
  if (!bottomNav || !mainContent) return;
  
  // Ensure main content has padding at bottom to account for fixed nav
  mainContent.style.paddingBottom = `${bottomNav.offsetHeight + 10}px`;
  
  // Add ripple effect to nav items
  const navItems = bottomNav.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Only add ripple effect if not going to current page
      if (!this.classList.contains('active')) {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    });
  });
}

/**
 * Gift Items Interaction - Converts single gift items to interactive sliders
 */
function initializeGiftItems() {
  const giftItems = document.querySelectorAll('.gift-item');
  
  if (giftItems.length === 0) return;
  
  // Convert single gift item to slider if there's only one
  const giftsContainer = document.querySelector('.gifts-slider');
  
  if (giftsContainer && giftItems.length === 1) {
    // Create more gift items for demo
    const gifts = [
      {
        image: '/images/products/gift1.jpg',
        originalPrice: 'Rp129.000',
        currentPrice: 'Rp0'
      },
      {
        image: '/images/products/gift2.jpg',
        originalPrice: 'Rp99.000',
        currentPrice: 'Rp0'
      },
      {
        image: '/images/products/gift3.jpg',
        originalPrice: 'Rp149.000',
        currentPrice: 'Rp0'
      }
    ];
    
    // Clear container
    giftsContainer.innerHTML = '';
    
    // Add new gift items
    gifts.forEach(gift => {
      const giftItem = document.createElement('div');
      giftItem.className = 'gift-item';
      giftItem.innerHTML = `
        <div class="gift-image">
          <img src="${gift.image}" alt="Free Gift">
        </div>
        <div class="gift-price">
          <div class="original-price">${gift.originalPrice}</div>
          <div class="current-price">${gift.currentPrice}</div>
        </div>
      `;
      
      giftsContainer.appendChild(giftItem);
    });
    
    // Convert to proper slider
    makeSlider(giftsContainer);
  }
}

/**
 * Create a slider from a container
 * @param {HTMLElement} container - Container element to convert to slider
 */
function makeSlider(container) {
  const items = container.children;
  if (items.length <= 1) return;
  
  // Add slider functionality
  container.classList.add('slider-container');
  
  // Wrap items in a slider track
  const track = document.createElement('div');
  track.className = 'slider-track';
  
  // Move all items to the track
  while (container.firstChild) {
    track.appendChild(container.firstChild);
  }
  
  container.appendChild(track);
  
  // Add navigation
  const prevBtn = document.createElement('button');
  prevBtn.className = 'slider-nav prev-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'slider-nav next-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  
  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  
  // Add indicators
  const indicators = document.createElement('div');
  indicators.className = 'slider-indicators';
  
  for (let i = 0; i < items.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-indicator' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    indicators.appendChild(dot);
  }
  
  container.appendChild(indicators);
  
  // Set up slider functionality
  let currentIndex = 0;
  const itemWidth = 100; // 100%
  
  function showSlide(index) {
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * itemWidth}%)`;
    
    // Update indicators
    const dots = indicators.querySelectorAll('.slider-indicator');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Click events for navigation
  prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
  
  // Click events for indicators
  const dots = indicators.querySelectorAll('.slider-indicator');
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => showSlide(i));
  });
  
  // Initialize first slide
  showSlide(0);
}

/**
 * Fix untuk Card Product Text yang Terpotong
 */
function fixProductCardText() {
  // Cari semua product card
  const productCards = document.querySelectorAll('.product-card');
  
  if (productCards.length === 0) return;
  
  productCards.forEach(card => {
    // Fix untuk nama produk yang terpotong
    const productName = card.querySelector('.product-name');
    if (productName) {
      // Pastikan tinggi elemen cukup untuk 2 baris text
      productName.style.height = '38px';
      productName.style.lineHeight = '1.3';
      productName.style.overflow = 'hidden';
      productName.style.display = '-webkit-box';
      productName.style.webkitLineClamp = '2';
      productName.style.webkitBoxOrient = 'vertical';
      
      // Tambahkan title attribute untuk hover tooltip jika text terpotong
      productName.title = productName.textContent.trim();
    }
    
    // Fix untuk harga produk yang terpotong
    const productPrice = card.querySelector('.product-price');
    if (productPrice) {
      productPrice.style.whiteSpace = 'nowrap';
      productPrice.style.overflow = 'hidden';
      productPrice.style.textOverflow = 'ellipsis';
    }
    
    // Fix untuk cashback amount yang terpotong
    const cashbackAmount = card.querySelector('.cashback-amount');
    if (cashbackAmount) {
      cashbackAmount.style.whiteSpace = 'nowrap';
    }
    
    // Pastikan gambar produk ditampilkan dengan benar
    const productImage = card.querySelector('.product-image img');
    if (productImage) {
      // Cek apakah gambar valid
      const checkImage = new Image();
      checkImage.onload = function() {
        // Gambar valid, tidak perlu tindakan
      };
      checkImage.onerror = function() {
        // Gambar tidak valid, ganti dengan placeholder
        productImage.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23cccccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"%3e%3crect width="18" height="18" x="3" y="3" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="9" cy="9" r="2"%3e%3c/circle%3e%3cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"%3e%3c/path%3e%3c/svg%3e';
        productImage.alt = 'Product Image';
      };
      checkImage.src = productImage.src;
    }
    
    // Tambahkan badge cashback jika belum ada
    if (!card.querySelector('.cashback-badge')) {
      const imageContainer = card.querySelector('.product-image');
      
      if (imageContainer) {
        const cashbackText = card.querySelector('.cashback-amount');
        let percentage = '10%';
        
        // Coba ambil persentase dari cashback amount jika tersedia
        if (cashbackText) {
          const amount = cashbackText.textContent.trim();
          const price = card.querySelector('.product-price');
          if (price) {
            const priceText = price.textContent.trim();
            // Extract angka dari string harga dan cashback
            const priceNum = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
            const cashbackNum = parseInt(amount.replace(/[^\d]/g, '')) || 0;
            
            if (priceNum > 0 && cashbackNum > 0) {
              const percent = Math.round((cashbackNum / priceNum) * 100);
              if (percent > 0 && percent < 100) {
                percentage = `${percent}%`;
              }
            }
          }
        }
        
        const cashbackBadge = document.createElement('div');
        cashbackBadge.className = 'cashback-badge';
        cashbackBadge.textContent = `${percentage} Cashback`;
        
        imageContainer.appendChild(cashbackBadge);
      }
    }
  });
  
  // Setelah perbaikan individual, samakan tinggi product card dalam satu baris
  equalizeProductCardHeights();
}

/**
 * Add placeholders for missing images
 */
function fixMissingImages() {
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      // Replace with a placeholder SVG
      this.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23cccccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"%3e%3crect width="18" height="18" x="3" y="3" rx="2" ry="2"%3e%3c/rect%3e%3ccircle cx="9" cy="9" r="2"%3e%3c/circle%3e%3cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"%3e%3c/path%3e%3c/svg%3e';
      this.alt = 'Image placeholder';
    };
  });
}

/**
 * Fix product cards for consistent display
 */
function fixProductCards() {
  const productCards = document.querySelectorAll('.product-card');
  
  if (productCards.length === 0) return;
  
  productCards.forEach(card => {
    // 1. Perbaiki nama produk yang terpotong
    const productName = card.querySelector('.product-name');
    if (productName) {
      // Pastikan teks nama produk ditampilkan dengan benar
      productName.style.display = '-webkit-box';
      productName.style.webkitLineClamp = '2';
      productName.style.webkitBoxOrient = 'vertical';
      productName.style.overflow = 'hidden';
      productName.style.textOverflow = 'ellipsis';
      productName.style.lineHeight = '1.3';
      productName.style.height = 'auto';
      productName.style.minHeight = '36px';
      productName.style.maxHeight = '36px';
      
      // Tambahkan tooltip untuk melihat nama lengkap saat hover
      if (productName.textContent.trim()) {
        productName.title = productName.textContent.trim();
      }
    }
    
    // 2. Perbaiki harga produk yang terpotong
    const productPrice = card.querySelector('.product-price');
    if (productPrice) {
      // Pastikan harga ditampilkan penuh
      const priceText = productPrice.textContent;
      
      // Periksa apakah harga terpotong (hanya menampilkan "Rp...")
      if (priceText.includes('Rp...') || priceText.endsWith('...')) {
        // Coba ambil data harga yang sebenarnya dari attribute
        const actualPrice = productPrice.getAttribute('data-price') || productPrice.dataset.price;
        
        if (actualPrice) {
          // Format harga dengan benar
          const formattedPrice = formatPrice(actualPrice);
          productPrice.textContent = formattedPrice;
        } else {
          // Jika tidak ada data harga, coba ekstrak dari teks yang ada
          const priceMatch = priceText.match(/Rp\D?(\d+)/);
          if (priceMatch && priceMatch[1]) {
            const extractedPrice = priceMatch[1];
            productPrice.textContent = `Rp${extractedPrice}`;
          }
        }
      }
      
      // Pastikan tampilan harga benar
      productPrice.style.whiteSpace = 'nowrap';
      productPrice.style.overflow = 'visible';
    }
    
    // 3. Perbaiki cashback yang terpotong
    const cashbackAmount = card.querySelector('.cashback-amount');
    if (cashbackAmount) {
      const cashbackText = cashbackAmount.textContent;
      
      // Periksa apakah cashback terpotong (hanya menampilkan "Rp1", "Rp2", dll)
      if (cashbackText.match(/^Rp\d{1,2}$/)) {
        // Coba ambil data cashback yang sebenarnya dari attribute
        const actualCashback = cashbackAmount.getAttribute('data-cashback') || cashbackAmount.dataset.cashback;
        
        if (actualCashback) {
          // Format cashback dengan benar
          const formattedCashback = formatPrice(actualCashback);
          cashbackAmount.textContent = formattedCashback;
        } else {
          // Jika tidak ada data cashback, coba perbaiki berdasarkan persentase
          const productPrice = card.querySelector('.product-price');
          const cashbackBadge = card.querySelector('.cashback-badge');
          
          if (productPrice && cashbackBadge) {
            const priceText = productPrice.textContent;
            const badgeText = cashbackBadge.textContent;
            
            // Ekstrak nilai harga dan persentase cashback
            const priceMatch = priceText.match(/Rp\D?(\d+)/);
            const percentMatch = badgeText.match(/(\d+)%/);
            
            if (priceMatch && priceMatch[1] && percentMatch && percentMatch[1]) {
              const price = parseInt(priceMatch[1].replace(/\./g, ''));
              const percent = parseInt(percentMatch[1]);
              
              // Hitung cashback berdasarkan persentase
              const calculatedCashback = Math.round((price * percent) / 100);
              if (!isNaN(calculatedCashback) && calculatedCashback > 0) {
                cashbackAmount.textContent = `Rp${formatNumber(calculatedCashback)}`;
              }
            }
          }
        }
      }
      
      // Pastikan tampilan cashback benar
      cashbackAmount.style.whiteSpace = 'nowrap';
      cashbackAmount.style.overflow = 'visible';
    }
  });
  
  // Setelah memperbaiki semua card, sesuaikan tinggi
  equalizeCardHeights();
}

/**
 * Menyamakan tinggi product card dalam satu baris
 */
function equalizeCardHeights() {
  // Tunggu gambar dimuat untuk mendapatkan tinggi yang tepat
  window.addEventListener('load', () => {
    const rows = {};
    const cards = document.querySelectorAll('.product-card');
    
    // Kelompokkan card berdasarkan posisi top (baris)
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const top = Math.floor(rect.top);
      
      if (!rows[top]) {
        rows[top] = [];
      }
      
      rows[top].push(card);
    });
    
    // Untuk setiap baris, tetapkan tinggi yang sama
    Object.values(rows).forEach(rowCards => {
      let maxHeight = 0;
      
      // Temukan tinggi maksimal natural
      rowCards.forEach(card => {
        card.style.height = 'auto';
        const height = card.offsetHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      });
      
      // Terapkan tinggi maksimal ke semua card dalam baris
      if (maxHeight > 0) {
        rowCards.forEach(card => {
          card.style.height = `${maxHeight}px`;
        });
      }
    });
  });
}

/**
 * Format angka dengan pemisah ribuan
 */
function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format harga dalam format "Rp123.456"
 */
function formatPrice(price) {
  // Jika price sudah dalam format string "Rp123.456", kembalikan apa adanya
  if (typeof price === 'string' && price.startsWith('Rp')) {
    return price;
  }
  
  // Jika price masih dalam bentuk angka atau string angka, format dengan benar
  const numericPrice = parseInt(price.toString().replace(/\D/g, ''));
  if (!isNaN(numericPrice)) {
    return `Rp${formatNumber(numericPrice)}`;
  }
  
  // Jika tidak bisa diformat, kembalikan string kosong
  return price;
}

/**
 * Menampilkan toast notification
 */
function showToast(message, duration = 2000) {
  // Cek apakah container toast sudah ada
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Buat toast baru
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  
  // Tambahkan ke container
  toastContainer.appendChild(toast);
  
  // Tampilkan dengan animasi
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto-hide setelah duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

/**
 * Check if an element is in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} - True if element is in viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Add animation when elements come into view
 */
function addScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  function checkElements() {
    animatedElements.forEach(el => {
      if (isElementInViewport(el) && !el.classList.contains('animated')) {
        el.classList.add('animated');
      }
    });
  }
  
  // Check on scroll
  window.addEventListener('scroll', checkElements);
  
  // Check on page load
  checkElements();
}

/**
 * Initialize back to top button
 */
function initBackToTopButton() {
  // Create button if it doesn't exist
  if (!document.getElementById('back-to-top')) {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .back-to-top-btn {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 40px;
        height: 40px;
        background-color: var(--primary-color, #ff0033);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 99;
        border: none;
      }
      
      .back-to-top-btn.visible {
        opacity: 1;
        visibility: visible;
      }
    `;
    document.head.appendChild(style);
    
    // Show/hide on scroll
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
      
      // Also check if need to load more products (if function exists)
      if (typeof window.loadMoreProducts === 'function' && isNearBottom()) {
        window.loadMoreProducts();
      }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Improved Category Tabs that integrates with infinite scroll
 */
function improvedCategoryTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const categoryProducts = document.querySelector('.category-products');
  
  if (tabButtons.length === 0 || !categoryProducts) return;
  
  // Klik handler untuk tab
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.textContent.trim();
      
      // Perbarui tampilan tab yang aktif
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update products section title if exists
      const sectionTitle = document.querySelector('.products-section-title');
      if (sectionTitle) {
        sectionTitle.textContent = category === 'For You' ? 'Produk Terbaru' : category;
      }
      
      // Filter products by category using the infinite scroll's filterByCategory function
      if (typeof window.filterByCategory === 'function') {
        window.filterByCategory(category === 'For You' ? '' : category);
      } else {
        // If infinite scroll not initialized, use the legacy approach
        showCategoryLoading(categoryProducts);
        
        // Simulate delay loading (akan diganti dengan AJAX request asli)
        setTimeout(() => {
          // Get products from initial state (for legacy compatibility)
          const initialProducts = Array.from(document.querySelectorAll('.product-card-template') || []);
          showCategoryProducts(category, categoryProducts, initialProducts);
        }, 500);
      }
      
      // Tampilkan toast notification
      showToast(`Loading ${category} products...`);
    });
  });
}

function showCategoryLoading(container) {
  // Simpan produk yang ada dalam array sementara
  const currentProducts = Array.from(container.children);
  
  // Buat elemen loading
  const loadingElement = document.createElement('div');
  loadingElement.className = 'category-loading';
  loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading products...</p>
  `;
  
  // Kosongkan container dan tambahkan loading state
  container.innerHTML = '';
  container.appendChild(loadingElement);
  
  // Simpan produk saat ini ke data attribute untuk digunakan kembali jika perlu
  container.setAttribute('data-previous-products', JSON.stringify(
    currentProducts.map(product => product.outerHTML)
  ));
}

function showCategoryProducts(category, container, initialProducts) {
  // Kosongkan container
  container.innerHTML = '';
  
  // Filter produk berdasarkan kategori (dalam implementasi nyata, ini akan diganti dengan AJAX request)
  // Untuk demo, kita akan menduplikasi produk yang ada dengan sedikit variasi
  
  if (category === 'For You' || category === '') {
    // Untuk kategori "For You", tampilkan semua produk
    initialProducts.forEach(product => {
      container.appendChild(product.cloneNode(true));
    });
  } else {
    // Untuk kategori lain, filter produk atau tampilkan produk demo
    // Dalam implementasi nyata, ini akan diganti dengan data dari server
    
    // Buat produk demo untuk kategori ini
    for (let i = 0; i < 4; i++) {
      // Gunakan template dari produk yang ada jika tersedia
      if (initialProducts.length > 0) {
        const demoProduct = initialProducts[i % initialProducts.length].cloneNode(true);
        
        // Modifikasi produk demo untuk kategori ini
        const productName = demoProduct.querySelector('.product-name');
        if (productName) {
          productName.textContent = `${category} Product ${i + 1}`;
        }
        
        // Modifikasi harga
        const productPrice = demoProduct.querySelector('.product-price');
        if (productPrice) {
          const basePrice = 100000 + (i * 50000);
          productPrice.textContent = `Rp${formatNumber(basePrice)}`;
        }
        
        // Modifikasi cashback
        const cashbackAmount = demoProduct.querySelector('.cashback-amount');
        if (cashbackAmount) {
          const cashback = 10000 + (i * 5000);
          cashbackAmount.textContent = `Rp${formatNumber(cashback)}`;
        }
        
        // Modifikasi badge cashback
        const cashbackBadge = demoProduct.querySelector('.cashback-badge');
        if (cashbackBadge) {
          const percent = 10 + (i * 2);
          cashbackBadge.textContent = `${percent}% Cashback`;
        }
        
        container.appendChild(demoProduct);
      }
    }
  }
  
  // Setelah menampilkan produk, perbaiki card
  fixProductCards();
}

// Call additional initialization functions if needed
document.addEventListener('DOMContentLoaded', function() {
  addScrollAnimations();
  initBackToTopButton();
  initializeHeroCarousel();
  initializeGiftItems();
  // Fix product cards to prevent text cutoff
  fixProductCardText();
  fixProductCards();
  improvedCategoryTabs();
  
  // Cash back Section Fix
  (function() {
    // Icon default untuk setiap step jika gambar tidak tersedia
    const defaultIcons = {
      'Salin tautan produk': '<i class="fas fa-link"></i>',
      'Buka MOVA cek Cashback': '<i class="fas fa-search-dollar"></i>',
      'Lanjutkan ke Shopee/TikTok': '<i class="fas fa-shopping-cart"></i>',
      'Dapatkan Cashback': '<i class="fas fa-wallet"></i>'
    };
    
    // Alternatif icon jika nama step tidak cocok dengan defaultIcons
    const fallbackIcons = [
      '<i class="fas fa-link"></i>',
      '<i class="fas fa-search-dollar"></i>',
      '<i class="fas fa-shopping-cart"></i>',
      '<i class="fas fa-wallet"></i>'
    ];

    function fixCashbackSection() {
      // Cari section cashback
      const cashbackSection = document.querySelector('.cashback-section');
      if (!cashbackSection) return;
      
      // Cari cashback steps
      const stepsContainer = cashbackSection.querySelector('.cashback-steps');
      if (!stepsContainer) return;
      
      // Perbaiki setiap step
      const steps = stepsContainer.querySelectorAll('.step');
      
      steps.forEach((step, index) => {
        // Cari icon container dan icon image
        const iconContainer = step.querySelector('.step-icon');
        if (!iconContainer) return;
        
        const iconImg = iconContainer.querySelector('img');
        
        // Cek jika gambar rusak atau tidak tersedia
        if (!iconImg || !iconImg.src || iconImg.src === 'null' || iconImg.src.includes('undefined') || 
            iconImg.naturalWidth === 0 || iconImg.src.includes('data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')) {
          
          // Cari teks step untuk menentukan icon yang tepat
          const stepText = step.querySelector('p')?.textContent.trim();
          let defaultIconHTML = '';
          
          // Pilih icon berdasarkan teks step
          if (stepText && defaultIcons[stepText]) {
            defaultIconHTML = defaultIcons[stepText];
          } else {
            // Gunakan fallback icon berdasarkan urutan
            defaultIconHTML = fallbackIcons[index % fallbackIcons.length];
          }
          
          // Tambahkan div untuk icon default jika belum ada
          if (!iconContainer.querySelector('.default-icon')) {
            const defaultIconElement = document.createElement('div');
            defaultIconElement.className = 'default-icon';
            defaultIconElement.innerHTML = defaultIconHTML;
            iconContainer.appendChild(defaultIconElement);
          }
          
          // Set style untuk icon container
          iconContainer.style.backgroundColor = '#f5f5f5';
          iconContainer.style.width = '60px';
          iconContainer.style.height = '60px';
          iconContainer.style.borderRadius = '50%';
          iconContainer.style.display = 'flex';
          iconContainer.style.alignItems = 'center';
          iconContainer.style.justifyContent = 'center';
          iconContainer.style.margin = '0 auto 10px';
          
          // Jika ada gambar, sembunyikan
          if (iconImg) {
            iconImg.style.display = 'none';
          }
        } else {
          // Jika gambar ada, perbaiki tampilan
          iconImg.style.objectFit = 'contain';
          iconImg.style.width = '30px';
          iconImg.style.height = '30px';
        }
        
        // Perbaiki tampilan teks
        const stepText = step.querySelector('p');
        if (stepText) {
          stepText.style.fontSize = '13px';
          stepText.style.margin = '0';
          stepText.style.color = '#333';
          stepText.style.fontWeight = '500';
          stepText.style.lineHeight = '1.3';
          stepText.style.minHeight = '35px';
          stepText.style.wordBreak = 'break-word';
        }
      });
      
      // Perbaiki tampilan container
      stepsContainer.style.display = 'flex';
      stepsContainer.style.justifyContent = 'space-between';
      stepsContainer.style.gap = '10px';
      stepsContainer.style.padding = '5px 0';
      stepsContainer.style.width = '100%';
      
      // Perbaiki tampilan section
      cashbackSection.style.backgroundColor = 'white';
      cashbackSection.style.padding = '20px';
      cashbackSection.style.borderRadius = '12px';
      cashbackSection.style.marginBottom = '20px';
      cashbackSection.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    }
    
    // Jalankan fix saat DOM siap
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fixCashbackSection);
    } else {
      fixCashbackSection();
    }
    
    // Jalankan fix lagi setelah semua resource dimuat
    window.addEventListener('load', fixCashbackSection);
    
    // Tambahkan observer untuk menangani perubahan DOM
    const observer = new MutationObserver(function(mutations) {
      fixCashbackSection();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  })();
  
  // Gift Slider Enhancement
  (function() {
    // Deteksi tampilan device
    function isMobileView() {
      return window.innerWidth <= 576;
    }
    
    function isDesktopView() {
      return window.innerWidth >= 768;
    }
    
    function isLargeDesktopView() {
      return window.innerWidth >= 1200;
    }
    
    // Mendapatkan jumlah item per slide berdasarkan viewport
    function getItemsPerSlide() {
      if (isMobileView()) return 1;
      if (isLargeDesktopView()) return 4;
      if (isDesktopView()) return 3;
      return 2; // Default untuk tablet
    }

    function isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    function initializeGiftSlider() {
      const giftsContainer = document.querySelector('.gifts-slider');
      if (!giftsContainer) return;
      
      // Reset jika sudah diinisialisasi sebelumnya
      if (giftsContainer.classList.contains('slider-initialized')) {
        // Jika ukuran layar berubah secara signifikan, reinisialisasi
        if (giftsContainer.getAttribute('data-view-type') === 'mobile' && !isMobileView() ||
            giftsContainer.getAttribute('data-view-type') === 'desktop' && !isDesktopView()) {
          
          // Kembalikan ke state asli sebelum reinisialisasi
          const originalHTML = giftsContainer.getAttribute('data-original-html');
          if (originalHTML) {
            giftsContainer.innerHTML = originalHTML;
            giftsContainer.classList.remove('slider-initialized');
            giftsContainer.removeAttribute('data-view-type');
          }
        } else {
          // Jika tidak ada perubahan signifikan, keluar
          return;
        }
      }
      
      // Simpan HTML asli untuk reset jika perlu
      if (!giftsContainer.getAttribute('data-original-html')) {
        giftsContainer.setAttribute('data-original-html', giftsContainer.innerHTML);
      }
      
      // Catat tipe tampilan saat ini
      if (isMobileView()) {
        giftsContainer.setAttribute('data-view-type', 'mobile');
      } else {
        giftsContainer.setAttribute('data-view-type', 'desktop');
      }
      
      // Ambil semua gift items
      const giftItems = giftsContainer.querySelectorAll('.gift-item');
      
      // Jika tidak ada items, tambahkan placeholder untuk demo
      if (giftItems.length === 0) {
        addPlaceholderItems(giftsContainer, 3); // Tambahkan 3 placeholder
      }
      
      // Periksa lagi setelah menambahkan item
      const updatedGiftItems = giftsContainer.querySelectorAll('.gift-item');
      
      // Convert ke slider full
      initSlider(giftsContainer, updatedGiftItems);
      
      // Tandai sebagai sudah diinisialisasi
      giftsContainer.classList.add('slider-initialized');
    }
    
    function addPlaceholderItems(container, count) {
      for (let i = 0; i < count; i++) {
        const giftItem = document.createElement('div');
        giftItem.className = 'gift-item';
        
        giftItem.innerHTML = `
          <div class="gift-image placeholder">
            <div class="placeholder-icon">
              <i class="fas fa-gift"></i>
            </div>
          </div>
          <div class="gift-price">
            <div class="original-price">Rp${(129000 + i * 20000).toLocaleString('id-ID')}</div>
            <div class="current-price">Rp0</div>
          </div>
        `;
        
        container.appendChild(giftItem);
      }
    }
    
    function initSlider(container, items) {
      // Bersihkan container
      container.innerHTML = '';
      
      // Buat slider track
      const track = document.createElement('div');
      track.className = 'slider-track';
      
      // Tentukan jumlah item per slide
      const itemsPerSlide = getItemsPerSlide();
      const totalItems = items.length;
      
      // Check apakah perlu navigasi pada desktop
      const needsNavigationOnDesktop = isDesktopView() && totalItems > itemsPerSlide;
      
      // Fix untuk iOS - pastikan slide width dan track width benar
      if (isIOS() && isMobileView()) {
        track.style.width = '100%';
        
        // Pastikan setiap item memiliki width 100%
        Array.from(items).forEach(item => {
          item.style.width = '100%';
          item.style.flex = '0 0 100%';
        });
      }
      
      // Tambahkan semua items ke track
      Array.from(items).forEach(item => {
        track.appendChild(item);
      });
      
      // Tambahkan track ke container
      container.appendChild(track);
      
      // Pada desktop dengan item <= itemsPerSlide, tidak perlu navigasi
      if (isDesktopView() && !needsNavigationOnDesktop) {
        // Setup layout untuk desktop tanpa navigasi
        setupDesktopWithoutNavigation(container, track, items);
      } else {
        // Setup slider dengan navigasi
        setupSliderWithNavigation(container, track, items, itemsPerSlide);
      }
      
      // Fix untuk gambar yang error
      fixBrokenImages(container);
    }
    
    function setupDesktopWithoutNavigation(container, track, items) {
      // Aplikasikan styling untuk desktop tanpa slider
      track.style.display = 'flex';
      track.style.justifyContent = 'space-between';
      
      // Beri style pada setiap item
      Array.from(items).forEach(item => {
        const widthPercentage = isLargeDesktopView() ? 
          (items.length <= 4 ? 100/items.length - 2 : 24) : 
          (items.length <= 3 ? 100/items.length - 2 : 32);
        
        item.style.flex = `0 0 ${widthPercentage}%`;
        item.style.margin = '0 0.5%';
      });
    }
    
    function setupSliderWithNavigation(container, track, items, itemsPerSlide) {
      const totalItems = items.length;
      const totalSlides = Math.ceil(totalItems / itemsPerSlide);
      
      // Buat navigasi
      const prevBtn = document.createElement('button');
      prevBtn.className = 'slider-nav prev-btn';
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'slider-nav next-btn';
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      
      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
      
      // Buat indikator
      const indicators = document.createElement('div');
      indicators.className = 'slider-indicators';
      
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'slider-indicator' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        indicators.appendChild(dot);
      }
      
      container.appendChild(indicators);
      
      // Untuk mobile
      if (isMobileView()) {
        implementMobileSlider(container, track, prevBtn, nextBtn, indicators, items, itemsPerSlide);
      } 
      // Untuk desktop dengan banyak item
      else if (isDesktopView() && totalItems > itemsPerSlide) {
        implementDesktopPagination(container, track, prevBtn, nextBtn, indicators, items, itemsPerSlide);
      }
    }
    
    function implementDesktopPagination(container, track, prevBtn, nextBtn, indicators, items, itemsPerSlide) {
      const totalItems = items.length;
      const totalSlides = Math.ceil(totalItems / itemsPerSlide);
      let currentSlide = 0;
      
      // Setup item style
      Array.from(items).forEach(item => {
        const widthPercentage = isLargeDesktopView() ? 24 : 32;
        item.style.flex = `0 0 ${widthPercentage}%`;
        item.style.margin = '0 0.5%';
        // Initially hide items not in first group
        if (Array.from(items).indexOf(item) >= itemsPerSlide) {
          item.style.display = 'none';
        }
      });
      
      // Update tampilan berdasarkan slide aktif
      function updateView() {
        const startIdx = currentSlide * itemsPerSlide;
        const endIdx = Math.min(startIdx + itemsPerSlide, totalItems);
        
        // Update visibility
        Array.from(items).forEach((item, index) => {
          item.style.display = (index >= startIdx && index < endIdx) ? 'block' : 'none';
        });
        
        // Update indikator
        const dots = indicators.querySelectorAll('.slider-indicator');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
      
      // Event handlers untuk navigasi
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateView();
      });
      
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateView();
      });
      
      // Event handlers untuk indikator
      const dots = indicators.querySelectorAll('.slider-indicator');
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          currentSlide = i;
          updateView();
        });
      });
    }
    
    function implementMobileSlider(container, track, prevBtn, nextBtn, indicators, items, itemsPerSlide) {
      const totalItems = items.length;
      let currentSlide = 0;
      
      // Setup style untuk mobile
      if (isIOS()) {
        // iOS membutuhkan perlakuan khusus
        track.style.width = `${totalItems * 100}%`;
        Array.from(items).forEach(item => {
          item.style.width = `${100 / totalItems}%`;
          item.style.flex = `0 0 ${100 / totalItems}%`;
        });
      } else {
        // Android dan browser lain
        Array.from(items).forEach(item => {
          item.style.flex = '0 0 100%';
          item.style.width = '100%';
        });
      }
      
      // Fungsi untuk menampilkan slide
      function showSlide(index) {
        // Wrap around
        if (index < 0) index = totalItems - 1;
        if (index >= totalItems) index = 0;
        
        currentSlide = index;
        
        // Update posisi track - untuk iOS gunakan translateX, yang lain gunakan flex order
        if (isIOS()) {
          track.style.transform = `translateX(-${currentSlide * (100 / totalItems)}%)`;
        } else {
          Array.from(items).forEach((item, i) => {
            if (i === currentSlide) {
              item.style.display = 'block';
              item.style.order = '1';
            } else {
              item.style.display = 'none';
              item.style.order = '2';
            }
          });
        }
        
        // Update indikator
        const dots = indicators.querySelectorAll('.slider-indicator');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
      
      // Event listener untuk navigasi
      prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
      nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
      
      // Event listener untuk indikator
      const dots = indicators.querySelectorAll('.slider-indicator');
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i));
      });
      
      // Touch events untuk swipe pada mobile
      let touchStartX = 0;
      let touchEndX = 0;
      
      container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
      
      function handleSwipe() {
        const threshold = 50; // Minimum swipe distance
        
        if (touchEndX < touchStartX - threshold) {
          // Swipe left, next slide
          showSlide(currentSlide + 1);
        } else if (touchEndX > touchStartX + threshold) {
          // Swipe right, previous slide
          showSlide(currentSlide - 1);
        }
      }
      
      // Inisialisasi slider dengan slide pertama
      showSlide(0);
      
      // Optional: Auto rotation
      let autoRotateInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
      
      // Stop rotation saat user berinteraksi dengan slider
      container.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
      container.addEventListener('touchstart', () => clearInterval(autoRotateInterval), { passive: true });
      
      container.addEventListener('mouseleave', () => {
        autoRotateInterval = setInterval(() => {
          showSlide(currentSlide + 1);
        }, 5000);
      });
      
      container.addEventListener('touchend', () => {
        setTimeout(() => {
          autoRotateInterval = setInterval(() => {
            showSlide(currentSlide + 1);
          }, 5000);
        }, 3000);
      }, { passive: true });
    }
    
    function fixBrokenImages(container) {
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.onerror = function() {
          // Ganti dengan placeholder icon
          const parent = this.closest('.gift-image');
          if (parent) {
            parent.classList.add('placeholder');
            this.style.display = 'none';
            
            if (!parent.querySelector('.placeholder-icon')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'placeholder-icon';
              placeholder.innerHTML = '<i class="fas fa-gift"></i>';
              parent.appendChild(placeholder);
            }
          }
        };
        
        // Trigger onerror jika src kosong atau null
        if (!img.src || img.src === 'null' || img.src === 'undefined') {
          img.onerror();
        }
      });
    }
    
    // Jalankan inisialisasi saat DOM siap
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeGiftSlider);
    } else {
      initializeGiftSlider();
    }
    
    // Jalankan ulang saat window resize untuk handle perubahan ukuran
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initializeGiftSlider();
      }, 250); // Debounce
    });
    
    // Jalankan setelah semua resource dimuat
    window.addEventListener('load', initializeGiftSlider);
  })();
});