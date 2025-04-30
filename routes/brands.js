const express = require('express');
const router = express.Router();
const { Product, Brand } = require('../models/Product-brand-models');

console.log('Loading brands routes module...');

const processCashbackData = (product) => {
  if (!product) return product;
  
  // Default cashback structure
  let defaultCashback = {
    percentage: 0,
    amount: 0
  };
  
  try {
    // Ensure cashback has proper structure
    if (!product.cashback) {
      product.cashback = defaultCashback;
    } else if (typeof product.cashback === 'number') {
      // If cashback is just a number, format it properly
      product.cashback = {
        percentage: Math.round((product.cashback / product.price) * 100),
        amount: product.cashback
      };
    } else if (!product.cashback.amount) {
      // Ensure amount property exists
      product.cashback.amount = 0;
    }
    
    // Ensure price is a number
    if (typeof product.price !== 'number') {
      product.price = parseFloat(product.price) || 0;
    }
  } catch (error) {
    console.error('Error processing cashback data:', error);
    product.cashback = defaultCashback;
  }
  
  return product;
};


router.get('/', async (req, res) => {
  try {
    // Fetch brands from database
    const brands = await Brand.findAll();
    
    // For each brand, get a few products
    for (let brand of brands) {
      try {
        // Use findByBrand instead of findByBrandId
        brand.products = await Product.findByBrand(brand.name, 5, 0);
        
        // Process cashback data for each product
        if (brand.products && brand.products.length) {
          for (let product of brand.products) {
            try {
              product.cashback = await Product.calculateCashback(product.id);
              if (!product.cashback) {
                product.cashback = { percentage: 0, amount: 0 };
              }
            } catch (cashbackError) {
              console.error(`Error calculating cashback for product ${product.id}:`, cashbackError);
              product.cashback = { percentage: 0, amount: 0 };
            }
          }
        }
      } catch (productError) {
        console.error(`Error fetching products for brand ${brand.name}:`, productError);
        brand.products = [];
      }
    }
    
    // TAMBAHKAN INI: Render halaman dengan HTML kustom langsung
    // Render custom brands view
    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Brands - MOVA</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          /* Modern, interactive styling */
          :root {
            --primary-color: #ff0033;
            --text-dark: #333333;
            --text-light: #666666;
            --bg-light: #ffffff;
            --bg-hover: #f9f9f9;
            --shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            --border-radius: 12px;
            --animation-speed: 0.3s;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.5;
            color: var(--text-dark);
            background-color: #f5f5f5;
            padding-bottom: 60px;
          }
          
          .app-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: white;
            min-height: 100vh;
            position: relative;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo {
            display: flex;
            flex-direction: column;
          }
          
          .logo a {
            color: white;
            font-weight: 700;
            font-size: 24px;
            text-decoration: none;
          }
          
          .tagline {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
          }
          
          .header-right a {
            color: white;
            text-decoration: none;
          }
          
          .search-bar {
            margin-top: 10px;
          }
          
          .search-bar form {
            display: flex;
            background-color: white;
            border-radius: var(--border-radius);
            overflow: hidden;
          }
          
          .search-bar input {
            flex: 1;
            padding: 10px 15px;
            border: none;
            outline: none;
            font-size: 14px;
          }
          
          .search-bar button {
            padding: 10px 15px;
            background-color: white;
            color: var(--primary-color);
            border: none;
            font-weight: 500;
            cursor: pointer;
          }
          
          .main-content {
            padding: 15px;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 20px;
            color: var(--text-dark);
            position: relative;
            padding-bottom: 10px;
          }
          
          .section-title:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background-color: var(--primary-color);
            border-radius: 3px;
          }
          
          /* Brand Card */
          .brand-card {
            background-color: var(--bg-light);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            margin-bottom: 25px;
            overflow: hidden;
            transition: transform var(--animation-speed), box-shadow var(--animation-speed);
          }
          
          .brand-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          }
          
          .brand-header {
            display: flex;
            padding: 20px;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color var(--animation-speed);
            text-decoration: none;
            color: inherit;
          }
          
          .brand-header:hover {
            background-color: var(--bg-hover);
          }
          
          .brand-logo {
            width: 80px;
            height: 80px;
            border-radius: 10px;
            object-fit: contain;
            background-color: #f9f9f9;
            padding: 5px;
            margin-right: 20px;
            border: 1px solid #f0f0f0;
            transition: transform var(--animation-speed);
          }
          
          .brand-header:hover .brand-logo {
            transform: scale(1.05);
          }
          
          .brand-info {
            flex: 1;
          }
          
          .brand-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--text-dark);
          }
          
          .brand-desc {
            font-size: 14px;
            color: var(--text-light);
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .cashback-badge {
            display: inline-block;
            background-color: rgba(255, 0, 51, 0.08);
            color: var(--primary-color);
            font-size: 13px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 20px;
          }
          
          /* Products section */
          .brand-products {
            padding: 20px;
          }
          
          .products-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-dark);
            position: relative;
            padding-left: 12px;
          }
          
          .products-title:before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background-color: var(--primary-color);
            border-radius: 2px;
          }
          
          .products-slider {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
            padding-bottom: 10px;
            -webkit-overflow-scrolling: touch;
          }
          
          .products-slider::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
          
          .product-item {
            flex: 0 0 140px;
            cursor: pointer;
            transition: transform var(--animation-speed);
            text-decoration: none;
            color: inherit;
          }
          
          .product-item:hover {
            transform: translateY(-5px);
          }
          
          .product-image {
            position: relative;
            height: 140px;
            border-radius: 10px;
            overflow: hidden;
            background-color: #f5f5f5;
            margin-bottom: 8px;
          }
          
          .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform var(--animation-speed);
          }
          
          .product-item:hover .product-image img {
            transform: scale(1.1);
          }
          
          .product-cashback {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: var(--primary-color);
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 15px;
            z-index: 1;
          }
          
          .product-name {
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 4px;
            color: var(--text-dark);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 40px;
          }
          
          .product-price {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-dark);
          }
          
          /* Bottom Navigation */
          .bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: white;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
            z-index: 100;
            max-width: 480px;
            margin: 0 auto;
          }
          
          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0;
            color: #999;
            text-decoration: none;
            font-size: 10px;
          }
          
          .nav-item i {
            font-size: 18px;
            margin-bottom: 5px;
          }
          
          .nav-item.active {
            color: var(--primary-color);
          }
          
          /* Responsive adjustments */
          @media (max-width: 480px) {
            .brand-header {
              padding: 15px;
            }
            
            .brand-logo {
              width: 60px;
              height: 60px;
              margin-right: 15px;
            }
            
            .brand-name {
              font-size: 16px;
            }
            
            .brand-desc {
              font-size: 13px;
            }
            
            .products-slider {
              gap: 10px;
            }
            
            .product-item {
              flex: 0 0 120px;
            }
            
            .product-image {
              height: 120px;
            }
          }
          
          @media (min-width: 768px) {
            body {
              background-color: #f0f0f0;
              padding: 20px 0;
            }
            
            .app-container {
              border-radius: 15px;
              overflow: hidden;
              min-height: calc(100vh - 40px);
              max-height: calc(100vh - 40px);
              overflow-y: auto;
            }
            
            .bottom-nav {
              left: 50%;
              transform: translateX(-50%);
            }
          }
        </style>
      </head>
      <body>
        <div class="app-container">
          <!-- Header -->
          <header class="header">
            <div class="header-content">
              <div class="logo">
                <a href="/">MOVA</a>
                <span class="tagline">Belanja Sambil Cuan</span>
              </div>
              <div class="header-right">
                <a href="/faq" class="faq-link">FAQ</a>
              </div>
            </div>
            <div class="search-bar">
              <form action="/search" method="GET">
                <input type="text" name="q" placeholder="Tempelkan tautan Shopee/TikTok">
                <button type="submit">Tempel</button>
              </form>
            </div>
          </header>

          <!-- Main Content -->
          <main class="main-content">
            <h1 class="section-title">Semua Brand</h1>
            
            ${brands.map(brand => `
              <div class="brand-card">
                <a href="/brands/${brand.id}" class="brand-header">
                  <img src="${brand.logo_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+JHticmFuZC5uYW1lLmNoYXJBdCgwKX08L3RleHQ+PC9zdmc+'}" alt="${brand.name}" class="brand-logo">
                  <div class="brand-info">
                    <h2 class="brand-name">${brand.name}</h2>
                    <p class="brand-desc">${brand.description || 'Brand resmi di MOVA'}</p>
                    <div class="cashback-badge">${brand.min_cashback || '1'}% - ${brand.max_cashback || '5'}% Cashback</div>
                  </div>
                </a>
                
                ${brand.products && brand.products.length > 0 ? `
                  <div class="brand-products">
                    <h3 class="products-title">Produk Populer</h3>
                    <div class="products-slider">
                      ${brand.products.map(product => `
                        <a href="/products/${product.id}" class="product-item">
                          <div class="product-image">
                            <img src="${product.image_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIiB2aWV3Qm94PSIwIDAgMTQwIDE0MCI+PHJlY3Qgd2lkdGg9IjE0MCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}" alt="${product.name}">
                            <span class="product-cashback">${(product.cashback && product.cashback.percentage) ? product.cashback.percentage : 0}%</span>
                          </div>
                          <h4 class="product-name">${product.name}</h4>
                          <p class="product-price">Rp${(product.price) ? product.price.toLocaleString('id-ID') : '0'}</p>
                        </a>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </main>

          <!-- Bottom Navigation -->
          <nav class="bottom-nav">
            <a href="/" class="nav-item">
              <i class="fas fa-home"></i>
              <span>Beranda</span>
            </a>
            <a href="/brands" class="nav-item active">
              <i class="fas fa-tag"></i>
              <span>Brand</span>
            </a>
            <a href="/user/dashboard" class="nav-item">
              <i class="fas fa-wallet"></i>
              <span>Pendapatan</span>
            </a>
            <a href="/user/profile" class="nav-item">
              <i class="fas fa-user"></i>
              <span>Saya</span>
            </a>
          </nav>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Add horizontal scroll with mousewheel support for products slider
            const productsSliders = document.querySelectorAll('.products-slider');
            
            productsSliders.forEach(slider => {
              // Mouse wheel horizontal scrolling
              slider.addEventListener('wheel', function(e) {
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  this.scrollLeft += e.deltaY;
                }
              });
              
              // Touch events for mobile swipe
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
                const walk = (x - startX) * 2; // Scroll speed
                slider.scrollLeft = scrollLeft - walk;
              });
            });
            
            // Adjust bottom nav for desktop
            function adjustBottomNav() {
              const bottomNav = document.querySelector('.bottom-nav');
              
              if (window.innerWidth >= 768) {
                bottomNav.style.maxWidth = '480px';
                bottomNav.style.left = '50%';
                bottomNav.style.transform = 'translateX(-50%)';
              } else {
                bottomNav.style.maxWidth = '';
                bottomNav.style.left = '0';
                bottomNav.style.transform = '';
              }
            }
            
            // Run when page loads
            adjustBottomNav();
            
            // Also run when window is resized
            window.addEventListener('resize', adjustBottomNav);
          });
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Brands page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brands page',
      currentPage: ''
    });
  }
});                  

// API endpoint to get products for a brand
// THIS MUST COME BEFORE THE /:id ROUTE!
console.log('Registering /brands/:id/products endpoint');
router.get('/:id/products', async (req, res) => {
  console.log(`GET /brands/${req.params.id}/products request received`);
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`Looking up brand ID: ${id}, limit: ${limit}`);
    
    const brand = await Brand.findById(id);
    
    if (!brand) {
      console.log(`Brand ID ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Brand not found' 
      });
    }
    
    console.log(`Found brand: ${brand.name}, getting products...`);
    
    const products = await Product.findByBrand(brand.name, limit, 0);
    console.log(`Found ${products.length} products for brand ${brand.name}`);
    
    // Calculate cashback for each product
    for (let product of products) {
      try {
        product.cashback = await Product.calculateCashback(product.id);
        processCashbackData(product);
      } catch (cashbackError) {
        console.error(`Error calculating cashback for product ${product.id}:`, cashbackError);
        product.cashback = { percentage: 0, amount: 0 };
      }
    }
    
    res.json({
      success: true,
      brand,
      products
    });
  } catch (error) {
    console.error('Error fetching brand products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch brand products',
      error: error.message
    });
  }
});


// Get brand details and products
router.get('/:id', async (req, res) => {
  console.log(`GET /brands/${req.params.id} request received`);
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).render('error', {
        title: 'Brand Not Found',
        message: 'The brand you requested could not be found',
        currentPage: ''
      });
    }
    
    const products = await Product.findByBrand(brand.name);
    
    // Calculate cashback for each product
    for (let product of products) {
      try {
        product.cashback = await Product.calculateCashback(product.id);
        processCashbackData(product);
      } catch (cashbackError) {
        console.error(`Error calculating cashback for product ${product.id}:`, cashbackError);
        product.cashback = { percentage: 0, amount: 0 };
      }
    }
    
    res.render('brands/detail', {
      title: `${brand.name} - MOVA`,
      brand,
      products,
      currentPage: 'brands',
      showSearchBar: true
    });
  } catch (error) {
    console.error('Brand detail page error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load brand details',
      currentPage: ''
    });
  }
});


console.log('All brand routes registered!');
module.exports = router;