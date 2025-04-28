/**
 * Admin Dashboard JavaScript
 * This file contains common scripts used throughout the admin dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Sidebar Toggle for Desktop
  const sidebarToggle = document.getElementById('sidebarToggle');
  const adminWrapper = document.querySelector('.admin-wrapper');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        // Mobile: show/hide sidebar
        adminWrapper.classList.toggle('sidebar-open');
      } else {
        // Desktop: collapse/expand sidebar
        adminWrapper.classList.toggle('sidebar-collapsed');
        
        // Store preference in localStorage
        if (adminWrapper.classList.contains('sidebar-collapsed')) {
          localStorage.setItem('sidebar-collapsed', 'true');
        } else {
          localStorage.setItem('sidebar-collapsed', 'false');
        }
      }
    });
  }
  
  // Check if sidebar should be collapsed (from localStorage)
  if (localStorage.getItem('sidebar-collapsed') === 'true' && window.innerWidth >= 992) {
    adminWrapper.classList.add('sidebar-collapsed');
  }
  
  // Close sidebar when backdrop is clicked
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', function() {
      adminWrapper.classList.remove('sidebar-open');
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
      // Remove sidebar-open class when resizing to desktop
      adminWrapper.classList.remove('sidebar-open');
    }
  });
  
  // Initialize all tooltips
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  if (tooltips.length > 0) {
    Array.from(tooltips).forEach(tooltip => {
      new bootstrap.Tooltip(tooltip);
    });
  }
  
  // Initialize all popovers
  const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
  if (popovers.length > 0) {
    Array.from(popovers).forEach(popover => {
      new bootstrap.Popover(popover);
    });
  }
  
  // Auto-hide alerts after 5 seconds
  const autoHideAlerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  if (autoHideAlerts.length > 0) {
    Array.from(autoHideAlerts).forEach(alert => {
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }, 5000);
    });
  }
  
  // Custom file upload
  const fileInputs = document.querySelectorAll('input[type="file"]');
  if (fileInputs.length > 0) {
    Array.from(fileInputs).forEach(input => {
      input.addEventListener('change', function(e) {
        // Find the closest parent with the 'custom-file-upload' class
        const customFileUpload = this.closest('.custom-file-upload');
        if (customFileUpload) {
          const fileNameElement = customFileUpload.querySelector('.file-name');
          if (fileNameElement) {
            if (this.files.length > 0) {
              fileNameElement.textContent = this.files[0].name;
              customFileUpload.classList.add('has-file');
            } else {
              fileNameElement.textContent = 'No file chosen';
              customFileUpload.classList.remove('has-file');
            }
          }
          
          // Handle image preview if available
          const previewElement = customFileUpload.querySelector('.preview-image');
          if (previewElement && this.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
              previewElement.src = e.target.result;
              previewElement.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
          }
        }
      });
    });
  }
  
  // Toggle password visibility
  const passwordToggles = document.querySelectorAll('.password-toggle');
  if (passwordToggles.length > 0) {
    Array.from(passwordToggles).forEach(toggle => {
      toggle.addEventListener('click', function() {
        const passwordInput = this.closest('.input-group').querySelector('input');
        const toggleIcon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggleIcon.classList.remove('fa-eye');
          toggleIcon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          toggleIcon.classList.remove('fa-eye-slash');
          toggleIcon.classList.add('fa-eye');
        }
      });
    });
  }
  
  // Custom datepicker initialization (if datepicker plugin is included)
  const datepickers = document.querySelectorAll('.datepicker');
  if (typeof flatpickr !== 'undefined' && datepickers.length > 0) {
    Array.from(datepickers).forEach(picker => {
      flatpickr(picker, {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'F j, Y',
        allowInput: true
      });
    });
  }
  
  // Custom date range picker initialization (if daterangepicker plugin is included)
  const dateRangePickers = document.querySelectorAll('.daterangepicker');
  if (typeof daterangepicker !== 'undefined' && dateRangePickers.length > 0) {
    Array.from(dateRangePickers).forEach(picker => {
      $(picker).daterangepicker({
        opens: 'left',
        autoUpdateInput: false,
        locale: {
          cancelLabel: 'Clear',
          applyLabel: 'Apply',
          fromLabel: 'From',
          toLabel: 'To'
        }
      });
      
      $(picker).on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
      });
      
      $(picker).on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
      });
    });
  }
  
  // Confirm delete actions
  const confirmDeleteButtons = document.querySelectorAll('[data-confirm-delete]');
  if (confirmDeleteButtons.length > 0) {
    Array.from(confirmDeleteButtons).forEach(button => {
      button.addEventListener('click', function(e) {
        const message = this.dataset.confirmMessage || 'Are you sure you want to delete this item? This action cannot be undone.';
        if (!confirm(message)) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Handle bulk actions in tables
  const bulkActionCheckAll = document.getElementById('bulkSelectAll');
  if (bulkActionCheckAll) {
    bulkActionCheckAll.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.bulk-select-item');
      Array.from(checkboxes).forEach(checkbox => {
        checkbox.checked = this.checked;
      });
      
      // Toggle bulk action buttons
      toggleBulkActionButtons();
    });
    
    // Individual checkboxes
    const individualCheckboxes = document.querySelectorAll('.bulk-select-item');
    if (individualCheckboxes.length > 0) {
      Array.from(individualCheckboxes).forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          // Update "select all" checkbox state
          const allCheckboxes = document.querySelectorAll('.bulk-select-item');
          const checkedCheckboxes = document.querySelectorAll('.bulk-select-item:checked');
          
          if (allCheckboxes.length === checkedCheckboxes.length) {
            bulkActionCheckAll.checked = true;
            bulkActionCheckAll.indeterminate = false;
          } else if (checkedCheckboxes.length === 0) {
            bulkActionCheckAll.checked = false;
            bulkActionCheckAll.indeterminate = false;
          } else {
            bulkActionCheckAll.checked = false;
            bulkActionCheckAll.indeterminate = true;
          }
          
          // Toggle bulk action buttons
          toggleBulkActionButtons();
        });
      });
    }
    
    // Toggle bulk action buttons based on selected items
    function toggleBulkActionButtons() {
      const bulkActionButtons = document.querySelector('.bulk-action-buttons');
      const checkedCheckboxes = document.querySelectorAll('.bulk-select-item:checked');
      
      if (bulkActionButtons) {
        if (checkedCheckboxes.length > 0) {
          bulkActionButtons.classList.remove('d-none');
        } else {
          bulkActionButtons.classList.add('d-none');
        }
      }
    }
    
    // Handle bulk action form submission
    const bulkActionForm = document.getElementById('bulkActionForm');
    const bulkActionSelect = document.getElementById('bulkAction');
    
    if (bulkActionForm && bulkActionSelect) {
      bulkActionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedAction = bulkActionSelect.value;
        if (!selectedAction) {
          alert('Please select an action');
          return;
        }
        
        const checkedItems = document.querySelectorAll('.bulk-select-item:checked');
        if (checkedItems.length === 0) {
          alert('Please select at least one item');
          return;
        }
        
        // If deleting, confirm with user
        if (selectedAction === 'delete' && !confirm('Are you sure you want to delete all selected items? This action cannot be undone.')) {
          return;
        }
        
        // Submit the form
        this.submit();
      });
    }
  }
  
  // Refresh data buttons
  const refreshButtons = document.querySelectorAll('[data-refresh]');
  if (refreshButtons.length > 0) {
    Array.from(refreshButtons).forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.dataset.refreshTarget;
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Add loading state
          this.disabled = true;
          const originalHtml = this.innerHTML;
          this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          
          // Get refresh URL
          const url = this.dataset.refreshUrl || window.location.href;
          
          // Ajax request to refresh data
          fetch(url)
            .then(response => response.text())
            .then(html => {
              // Create a temporary element to parse the response
              const tempElement = document.createElement('div');
              tempElement.innerHTML = html;
              
              // Find the corresponding element in the response
              const newContent = tempElement.querySelector('#' + targetId);
              
              if (newContent) {
                targetElement.innerHTML = newContent.innerHTML;
              }
              
              // Restore button state
              this.disabled = false;
              this.innerHTML = originalHtml;
            })
            .catch(error => {
              console.error('Error refreshing data:', error);
              
              // Restore button state
              this.disabled = false;
              this.innerHTML = originalHtml;
              
              // Show error
              alert('Failed to refresh data. Please try again.');
            });
        }
      });
    });
  }

  // Initialize any Charts if Chart.js is available
  if (typeof Chart !== 'undefined') {
    initializeCharts();
  }
  
  // Responsive Tables
  const responsiveTables = document.querySelectorAll('.table-responsive');
  if (responsiveTables.length > 0) {
    Array.from(responsiveTables).forEach(table => {
      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'table-responsive';
      
      // Replace the table with the wrapper containing the table
      table.parentNode.insertBefore(tableWrapper, table);
      tableWrapper.appendChild(table);
    });
  }
});

// Initialize Chart.js charts
function initializeCharts() {
  // Common chart options
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#718096';
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
  
  // Sales Chart
  const salesChartEl = document.getElementById('salesChart');
  if (salesChartEl) {
    try {
      const chartData = JSON.parse(salesChartEl.dataset.chart);
      
      new Chart(salesChartEl, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Sales',
              data: chartData.sales,
              backgroundColor: 'rgba(78, 115, 223, 0.1)',
              borderColor: 'rgba(78, 115, 223, 1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: 'rgba(78, 115, 223, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              padding: 12,
              backgroundColor: 'rgba(45, 55, 72, 0.9)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing sales chart:', error);
    }
  }
  
  // Orders Chart
  const ordersChartEl = document.getElementById('ordersChart');
  if (ordersChartEl) {
    try {
      const chartData = JSON.parse(ordersChartEl.dataset.chart);
      
      new Chart(ordersChartEl, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Orders',
              data: chartData.orders,
              backgroundColor: 'rgba(28, 200, 138, 0.6)',
              borderColor: 'rgba(28, 200, 138, 1)',
              borderWidth: 1,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              borderRadius: 4
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              padding: 12,
              backgroundColor: 'rgba(45, 55, 72, 0.9)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing orders chart:', error);
    }
  }
  
  // User Growth Chart
  const userGrowthChartEl = document.getElementById('userGrowthChart');
  if (userGrowthChartEl) {
    try {
      const chartData = JSON.parse(userGrowthChartEl.dataset.chart);
      
      new Chart(userGrowthChartEl, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'New Users',
              data: chartData.users,
              backgroundColor: 'rgba(231, 74, 59, 0.1)',
              borderColor: 'rgba(231, 74, 59, 1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: 'rgba(231, 74, 59, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              padding: 12,
              backgroundColor: 'rgba(45, 55, 72, 0.9)'
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing user growth chart:', error);
    }
  }
  
  // Transactions Chart
  const transactionsChartEl = document.getElementById('transactionsChart');
  if (transactionsChartEl) {
    try {
      const chartData = JSON.parse(transactionsChartEl.dataset.chart);
      
      new Chart(transactionsChartEl, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Income',
              data: chartData.income,
              backgroundColor: 'rgba(28, 200, 138, 0.4)',
              borderColor: 'rgba(28, 200, 138, 1)',
              borderWidth: 1,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              borderRadius: 4,
              stack: 'Stack 0'
            },
            {
              label: 'Withdrawals',
              data: chartData.withdrawals,
              backgroundColor: 'rgba(246, 194, 62, 0.4)',
              borderColor: 'rgba(246, 194, 62, 1)',
              borderWidth: 1,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              borderRadius: 4,
              stack: 'Stack 1'
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing transactions chart:', error);
    }
  }
  
  // Pie/Doughnut Chart
  const pieChartEl = document.getElementById('categoryPieChart');
  if (pieChartEl) {
    try {
      const chartData = JSON.parse(pieChartEl.dataset.chart);
      
      new Chart(pieChartEl, {
        type: 'doughnut',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              data: chartData.data,
              backgroundColor: [
                'rgba(78, 115, 223, 0.8)',
                'rgba(28, 200, 138, 0.8)',
                'rgba(246, 194, 62, 0.8)',
                'rgba(231, 74, 59, 0.8)',
                'rgba(54, 185, 204, 0.8)',
                'rgba(104, 109, 224, 0.8)',
                'rgba(129, 236, 236, 0.8)',
                'rgba(126, 214, 223, 0.8)'
              ],
              borderColor: [
                'rgba(78, 115, 223, 1)',
                'rgba(28, 200, 138, 1)',
                'rgba(246, 194, 62, 1)',
                'rgba(231, 74, 59, 1)',
                'rgba(54, 185, 204, 1)',
                'rgba(104, 109, 224, 1)',
                'rgba(129, 236, 236, 1)',
                'rgba(126, 214, 223, 1)'
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.formattedValue;
                  const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                  const percentage = Math.round((context.raw / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    } catch (error) {
      console.error('Error initializing pie chart:', error);
    }
  }
}

// Logo Preview for Brand Forms
document.addEventListener('DOMContentLoaded', function() {
  const logoInput = document.getElementById('logo');
  const logoPreview = document.getElementById('logoPreview');
  
  if (logoInput && logoPreview) {
    logoInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          if (logoPreview.tagName === 'DIV' && logoPreview.querySelector('img')) {
            logoPreview.querySelector('img').src = e.target.result;
          } else if (logoPreview.tagName === 'IMG') {
            logoPreview.src = e.target.result;
          }
        };
        
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
});

// Order Status Update Form
document.addEventListener('DOMContentLoaded', function() {
  const statusSelect = document.getElementById('status');
  const shippingStatusSelect = document.getElementById('shipping_status');
  
  if (statusSelect && shippingStatusSelect) {
    statusSelect.addEventListener('change', function() {
      // If order is cancelled, disable shipping status
      if (this.value === 'cancelled') {
        shippingStatusSelect.disabled = true;
        shippingStatusSelect.value = 'pending';
      } else {
        shippingStatusSelect.disabled = false;
      }
      
      // If order is completed, set shipping status to delivered by default
      if (this.value === 'completed') {
        shippingStatusSelect.value = 'delivered';
      }
    });
  }
});

// Form validation 
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('.needs-validation');
  
  if (forms.length > 0) {
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        form.classList.add('was-validated');
      }, false);
    });
  }
});

// Dashboard DataTable Initialization (if DataTables is available)
document.addEventListener('DOMContentLoaded', function() {
  if (typeof $.fn.DataTable !== 'undefined') {
    $('.datatable').DataTable({
      responsive: true,
      lengthMenu: [5, 10, 25, 50],
      pageLength: 10,
      language: {
        search: "",
        searchPlaceholder: "Search...",
        lengthMenu: "_MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ entries",
        infoEmpty: "Showing 0 to 0 of 0 entries",
        infoFiltered: "(filtered from _MAX_ total entries)",
        paginate: {
          first: '<i class="fas fa-angle-double-left"></i>',
          previous: '<i class="fas fa-angle-left"></i>',
          next: '<i class="fas fa-angle-right"></i>',
          last: '<i class="fas fa-angle-double-right"></i>'
        }
      }
    });
  }
});

// Export Table Data (if relevant libraries are loaded)
document.addEventListener('DOMContentLoaded', function() {
  const exportButtons = document.querySelectorAll('[data-export]');
  
  if (exportButtons.length > 0 && typeof $.fn.DataTable !== 'undefined') {
    Array.from(exportButtons).forEach(button => {
      button.addEventListener('click', function() {
        const exportType = this.dataset.export;
        const tableId = this.dataset.table;
        const filename = this.dataset.filename || 'export';
        const table = document.getElementById(tableId);
        
        if (table) {
          // Create sanitized title for the export
          const title = (this.dataset.title || 'Export Data').replace(/[^a-z0-9]/gi, '_');
          
          if (exportType === 'excel' && typeof XLSX !== 'undefined') {
            exportTableToExcel(table, filename);
          } else if (exportType === 'csv') {
            exportTableToCSV(table, filename);
          } else if (exportType === 'pdf' && typeof jsPDF !== 'undefined') {
            exportTableToPDF(table, filename, title);
          } else if (exportType === 'print') {
            printTable(table);
          }
        }
      });
    });
  }
  
  // Export to Excel
  function exportTableToExcel(table, filename) {
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
  
  // Export to CSV
  function exportTableToCSV(table, filename) {
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvData = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      return cells.map(cell => {
        // Replace HTML with text content and escape any quotes
        return `"${cell.textContent.replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Export to PDF
  function exportTableToPDF(table, filename, title) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4');
    
    doc.text(title, 40, 40);
    
    const columns = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
    const data = Array.from(table.querySelectorAll('tbody tr')).map(row => {
      return Array.from(row.querySelectorAll('td')).map(td => td.textContent);
    });
    
    doc.autoTable({
      head: [columns],
      body: data,
      startY: 60,
      margin: { top: 20 },
      styles: { overflow: 'linebreak' },
      headStyles: { fillColor: [78, 115, 223] }
    });
    
    doc.save(`${filename}.pdf`);
  }
  
  // Print Table
  function printTable(table) {
    const win = window.open('', '', 'height=700,width=700');
    win.document.write('<html><head><title>Print Table</title>');
    win.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
    win.document.write('</head><body>');
    win.document.write('<h1>Print View</h1>');
    win.document.write(table.outerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }
});