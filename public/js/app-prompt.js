// JavaScript for handling app download prompt

document.addEventListener('DOMContentLoaded', function() {
    // Get the app download prompt element
    const appPrompt = document.getElementById('app-download-prompt');
    
    // If the prompt exists, handle its interactions
    if (appPrompt) {
      // Handle closing the prompt
      const closeButton = document.getElementById('close-prompt');
      if (closeButton) {
        closeButton.addEventListener('click', function() {
          // Hide the prompt
          appPrompt.style.display = 'none';
          
          // Send request to set cookie to hide prompt for a week
          fetch('/hide-app-prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(response => {
            if (!response.ok) {
              console.error('Failed to set hide-app-prompt cookie');
            }
          }).catch(error => {
            console.error('Error:', error);
          });
        });
      }
      
      // Handle Android/iOS specific logic
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Check if device is iOS
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      
      // Check if device is Android
      const isAndroid = /android/i.test(userAgent);
      
      // Show appropriate download buttons
      const downloadButtons = appPrompt.querySelectorAll('.download-btn');
      downloadButtons.forEach(button => {
        // If button is for Play Store (Android)
        if (button.textContent.includes('Play Store')) {
          button.style.display = isIOS ? 'none' : 'block';
        }
        
        // If button is for App Store (iOS)
        if (button.textContent.includes('App Store')) {
          button.style.display = isAndroid ? 'none' : 'block';
        }
      });
      
      // Handle deep linking for app
      downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          // Try to open the app first before going to store
          if (isAndroid) {
            // For Android, try to open with intent URL
            window.location.href = 'mova://home';
            
            // Set timeout to go to Play Store if app isn't installed
            setTimeout(function() {
              window.location.href = href;
            }, 500);
          } else if (isIOS) {
            // For iOS, try to open with custom URL scheme
            window.location.href = 'mova://home';
            
            // Set timeout to go to App Store if app isn't installed
            setTimeout(function() {
              window.location.href = href;
            }, 500);
          }
        });
      });
    }
  });