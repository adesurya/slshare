/**
 * bottom-nav-with-header.js
 * Script untuk memastikan bottom navigation selalu berada di paling bawah layout
 * pada semua halaman, tanpa menghilangkan header
 */

document.addEventListener('DOMContentLoaded', function() {
    // Jalankan hanya di tampilan desktop
    if (window.innerWidth >= 768) {
      fixNavigation();
    }
    
    // Tangani resize window
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
        fixNavigation();
      } else {
        resetStyles();
      }
    });
  });
  
  /**
   * Fix navigasi desktop
   */
  function fixNavigation() {
    // Tambahkan style untuk layout
    applyStyles();
    
    // Atur posisi bottom navigation
    positionBottomNav();
    
    // Tambahkan listener untuk scroll
    window.addEventListener('scroll', positionBottomNav);
    window.addEventListener('resize', positionBottomNav);
  }
  
  /**
   * Terapkan style untuk layout desktop
   */
  function applyStyles() {
    // Hapus style lama jika ada
    const oldStyle = document.getElementById('bottom-nav-with-header-style');
    if (oldStyle) oldStyle.remove();
    
    // Buat style baru
    const style = document.createElement('style');
    style.id = 'bottom-nav-with-header-style';
    style.textContent = `
      @media (min-width: 768px) {
        /* Body style */
        body {
          background-color: #f5f5f5 !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }
        
        /* App container */
        .app-container {
          width: 390px !important;
          display: flex !important;
          flex-direction: column !important;
          margin: 20px auto !important;
          background-color: white !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          position: relative !important;
        }
        
        /* Header - pastikan terlihat */
        .header {
          width: 100% !important;
          position: relative !important;
          z-index: 10 !important;
          flex-shrink: 0 !important;
          display: block !important;
          visibility: visible !important;
        }
        
        /* Konten utama */
        .main-content {
          flex: 1 !important;
          width: 100% !important;
          min-height: 250px !important;
          padding-bottom: 70px !important; /* Ruang untuk bottom nav */
          box-sizing: border-box !important;
          overflow-y: auto !important;
          position: relative !important;
        }
        
        /* Styling brand container */
        .brands-container, .brand-detail-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 15px !important;
          box-sizing: border-box !important;
        }
        
        /* Bottom navigation */
        .bottom-nav {
          left: 50% !important;
          right: 50% !important;

          width: 390px !important;
          margin: 0 !important;
          background-color: white !important;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
          z-index: 1000 !important;
          border-radius: 0 0 20px 20px !important;
        }


    `;
    
    // Tambahkan style ke head
    document.head.appendChild(style);
  }
  
  /**
   * Posisikan bottom navigation di bagian bawah
   */
  function positionBottomNav() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;
    
    // Cari container aplikasi
    const appContainer = document.querySelector('.app-container');
    let container = appContainer;
    
    // Jika tidak ada app container, gunakan parent dari main-content
    if (!container) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent && mainContent.parentNode) {
        container = mainContent.parentNode;
      }
    }
    
    // Jika masih tidak ada container, gunakan body
    if (!container) {
      container = document.body;
    }
    
    // Dapatkan informasi ukuran dan posisi container
    const rect = container.getBoundingClientRect();
    
    // Posisikan bottom nav
    bottomNav.style.position = 'fixed';
    bottomNav.style.left = `${rect.left}px`;
    bottomNav.style.width = `${rect.width}px`;
    
    // Tentukan posisi bottom
    if (rect.height + rect.top < window.innerHeight) {
      // Container lebih pendek dari viewport, posisikan di bawah container
      bottomNav.style.bottom = `${window.innerHeight - (rect.top + rect.height)}px`;
    } else {
      // Container lebih tinggi dari viewport, posisikan di bawah viewport
      bottomNav.style.bottom = '0px';
    }
  }
  
  /**
   * Reset style ke default
   */
  function resetStyles() {
    // Hapus style
    const style = document.getElementById('bottom-nav-with-header-style');
    if (style) style.remove();
    
    // Reset bottom nav style
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
      bottomNav.style.position = '';
      bottomNav.style.left = '';
      bottomNav.style.bottom = '';
      bottomNav.style.width = '';
    }
    
    // Hapus event listeners
    window.removeEventListener('scroll', positionBottomNav);
    window.removeEventListener('resize', positionBottomNav);
  }