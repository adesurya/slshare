// Dark mode functionality for MOVA web application

document.addEventListener('DOMContentLoaded', function() {
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled' || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches && 
                       localStorage.getItem('darkMode') !== 'disabled');
    
    // Get the body element
    const body = document.body;
    
    // Add dark mode class if enabled
    if (isDarkMode) {
      body.classList.add('dark-mode-enabled');
    }
    
    // Add dark mode toggle to profile page
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
      // Create dark mode toggle section
      const darkModeSection = document.createElement('div');
      darkModeSection.className = 'profile-section';
      darkModeSection.innerHTML = `
        <div class="section-header">
          <h3>Appearance</h3>
        </div>
        <div class="settings-item">
          <div class="setting-label">
            <i class="fas fa-moon"></i>
            <span>Dark Mode</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="dark-mode-toggle" ${isDarkMode ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      `;
      
      // Add toggle switch styles
      const style = document.createElement('style');
      style.textContent = `
        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
        }
        
        .setting-label {
          display: flex;
          align-items: center;
        }
        
        .setting-label i {
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 22px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 22px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #ff0033;
        }
        
        input:focus + .toggle-slider {
          box-shadow: 0 0 1px #ff0033;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
      `;
      document.head.appendChild(style);
      
      // Find position to insert dark mode toggle (before logout button)
      const logoutBtn = profileContainer.querySelector('.logout-btn');
      if (logoutBtn) {
        profileContainer.insertBefore(darkModeSection, logoutBtn);
      } else {
        profileContainer.appendChild(darkModeSection);
      }
      
      // Add event listener to dark mode toggle
      const darkModeToggle = document.getElementById('dark-mode-toggle');
      if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
          if (this.checked) {
            body.classList.add('dark-mode-enabled');
            localStorage.setItem('darkMode', 'enabled');
          } else {
            body.classList.remove('dark-mode-enabled');
            localStorage.setItem('darkMode', 'disabled');
          }
        });
      }
    }
    
    // Listen for system dark mode changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
      // Only apply if user hasn't explicitly set a preference
      if (localStorage.getItem('darkMode') === null) {
        if (e.matches) {
          body.classList.add('dark-mode-enabled');
        } else {
          body.classList.remove('dark-mode-enabled');
        }
      }
    });
  });