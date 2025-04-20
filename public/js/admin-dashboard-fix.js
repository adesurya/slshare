// admin-dashboard-fix.js
// This script fixes the Chart.js loading issue and improves admin dashboard layout

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard fix script loaded');
    
    // Function to load Chart.js dynamically
    function loadChartJS(callback) {
      // Check if Chart.js is already loaded
      if (typeof Chart !== 'undefined') {
        console.log('Chart.js is already loaded');
        if (callback) callback();
        return;
      }
      
      console.log('Loading Chart.js dynamically');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      script.integrity = 'sha256-+8RZJua0aEWg+QVVKg4LEzEEm/8RFez5Tb4JBNiV5xA=';
      script.crossOrigin = 'anonymous';
      
      script.onload = function() {
        console.log('Chart.js loaded successfully');
        if (callback) callback();
      };
      
      script.onerror = function() {
        console.error('Failed to load Chart.js');
      };
      
      document.head.appendChild(script);
    }
    
    // Function to initialize charts once Chart.js is loaded
    function initializeCharts() {
      console.log('Initializing charts');
      
      // Monthly Transactions Chart
      const transactionsChartEl = document.getElementById('monthlyTransactionsChart');
      if (transactionsChartEl) {
        console.log('Found monthly transactions chart element');
        // Get chart data from data attribute
        let chartData;
        try {
          chartData = JSON.parse(transactionsChartEl.dataset.chart);
          console.log('Chart data parsed successfully:', chartData);
        } catch (e) {
          console.error('Error parsing chart data:', e);
          chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            withdrawals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          };
        }
        
        // Create the chart with better styling
        new Chart(transactionsChartEl, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: 'Income',
                data: chartData.income,
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                borderRadius: 4
              },
              {
                label: 'Withdrawals',
                data: chartData.withdrawals,
                backgroundColor: 'rgba(255, 193, 7, 0.6)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  callback: function(value) {
                    return 'Rp' + value.toLocaleString('id-ID');
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  padding: 20,
                  boxWidth: 15,
                  usePointStyle: true
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                padding: 10,
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += 'Rp' + context.parsed.y.toLocaleString('id-ID');
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
        
        console.log('Monthly transactions chart created');
      }
      
      // Users Growth Chart
      const usersChartEl = document.getElementById('usersGrowthChart');
      if (usersChartEl) {
        console.log('Found users growth chart element');
        // Get chart data from data attribute
        let chartData;
        try {
          chartData = JSON.parse(usersChartEl.dataset.chart);
          console.log('Users chart data parsed successfully:', chartData);
        } catch (e) {
          console.error('Error parsing users chart data:', e);
          chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            users: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          };
        }
        
        // Create the chart with better styling
        new Chart(usersChartEl, {
          type: 'line',
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: 'New Users',
                data: chartData.users,
                backgroundColor: 'rgba(255, 0, 51, 0.1)',
                borderColor: 'rgba(255, 0, 51, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgba(255, 0, 51, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                padding: 10
              }
            }
          }
        });
        
        console.log('Users growth chart created');
      }
    }
    
    // Fix dashboard layout issues
    function fixDashboardLayout() {
      console.log('Fixing dashboard layout');
      
      // Add Bootstrap row class to stat cards if missing
      const statCards = document.querySelector('.dashboard-stats');
      if (statCards && !statCards.querySelector('.row')) {
        const cardGroups = statCards.querySelectorAll('.col-xl-3');
        if (cardGroups.length > 0) {
          const row = document.createElement('div');
          row.className = 'row';
          cardGroups.forEach(card => {
            statCards.removeChild(card);
            row.appendChild(card);
          });
          statCards.appendChild(row);
          console.log('Added missing row to stat cards');
        }
      }
      
      // Fix chart containers height
      const chartContainers = document.querySelectorAll('.chart-container');
      chartContainers.forEach(container => {
        container.style.height = '300px';
        console.log('Fixed chart container height');
      });
      
      // Ensure proper Bootstrap grid on all components
      const rowElements = document.querySelectorAll('.row');
      rowElements.forEach(row => {
        // Make sure all direct children have col-* classes
        Array.from(row.children).forEach(child => {
          if (!Array.from(child.classList).some(cls => cls.startsWith('col-'))) {
            child.classList.add('col-12');
            console.log('Added missing column class to row child');
          }
        });
      });
    }
    
    // Add event listener for refresh button
    function setupRefreshButton() {
      const refreshButton = document.getElementById('refreshTransactionsChart');
      if (refreshButton) {
        console.log('Found refresh button');
        refreshButton.addEventListener('click', function() {
          console.log('Refresh button clicked');
          // Show loading indicator
          const chartContainer = document.getElementById('monthlyTransactionsChart').closest('.chart-container');
          const loadingOverlay = document.createElement('div');
          loadingOverlay.className = 'chart-loading-overlay';
          loadingOverlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
          chartContainer.style.position = 'relative';
          loadingOverlay.style.position = 'absolute';
          loadingOverlay.style.top = '0';
          loadingOverlay.style.left = '0';
          loadingOverlay.style.right = '0';
          loadingOverlay.style.bottom = '0';
          loadingOverlay.style.display = 'flex';
          loadingOverlay.style.alignItems = 'center';
          loadingOverlay.style.justifyContent = 'center';
          loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
          loadingOverlay.style.zIndex = '10';
          chartContainer.appendChild(loadingOverlay);
          
          // Fetch updated data
          fetch('/admin/dashboard/api/transaction-stats')
            .then(response => response.json())
            .then(data => {
              console.log('Received refresh data:', data);
              if (data.success) {
                const chartEl = document.getElementById('monthlyTransactionsChart');
                const chart = Chart.getChart(chartEl);
                if (chart) {
                  console.log('Updating chart with new data');
                  chart.data.labels = data.data.labels;
                  chart.data.datasets[0].data = data.data.income;
                  chart.data.datasets[1].data = data.data.withdrawals;
                  chart.update();
                }
              }
              // Remove loading overlay
              chartContainer.removeChild(loadingOverlay);
            })
            .catch(error => {
              console.error('Error refreshing chart:', error);
              // Remove loading overlay even on error
              chartContainer.removeChild(loadingOverlay);
              // Show error message
              alert('Failed to refresh chart data. Please try again.');
            });
        });
      }
    }
    
    // Add missing styles
    function addMissingStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .chart-container {
          position: relative;
          height: 300px !important;
          margin-bottom: 1.5rem;
          width: 100%;
        }
        
        .stat-card {
          border-radius: 0.5rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          background-color: #fff;
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        .card {
          height: 100%;
          margin-bottom: 1.5rem;
        }
        
        .card-body {
          padding: 1.25rem;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 0.25rem solid rgba(0, 0, 0, 0.1);
          border-right-color: #ff0033;
          border-radius: 50%;
          animation: spinner 1s linear infinite;
        }
        
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      console.log('Added missing styles');
    }
    
    // Execute all fixes in the correct order
    function runAllFixes() {
      addMissingStyles();
      fixDashboardLayout();
      loadChartJS(function() {
        initializeCharts();
        setupRefreshButton();
      });
    }
    
    // Run all fixes
    runAllFixes();
  });