// Admin Dashboard Scripts

// Handle DataTables initialization for all tables with the 'data-table' class
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DataTables if the library is loaded
    if (typeof $.fn.DataTable !== 'undefined') {
      $('.data-table').DataTable({
        responsive: true,
        pageLength: 10,
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Search...",
          lengthMenu: "Show _MENU_ entries per page",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          infoEmpty: "Showing 0 to 0 of 0 entries",
          infoFiltered: "(filtered from _MAX_ total entries)"
        }
      });
    }
  
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  
    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  
    // Handle file input change to show selected file name
    const fileInputs = document.querySelectorAll('.custom-file-input');
    fileInputs.forEach(input => {
      input.addEventListener('change', function() {
        let fileName = '';
        if (this.files && this.files.length > 0) {
          fileName = this.files[0].name;
        }
        const label = this.nextElementSibling;
        if (label) {
          label.textContent = fileName || 'Choose file';
        }
        
        // Show preview for image files
        const preview = document.querySelector('.file-upload-preview');
        if (preview && this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
          }
          reader.readAsDataURL(this.files[0]);
        }
      });
    });
  
    // Setup delete confirmation modals
    const deleteButtons = document.querySelectorAll('[data-delete-item]');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const itemId = this.dataset.deleteItem;
        const itemName = this.dataset.itemName || 'this item';
        const targetUrl = this.href;
        
        // Set modal content
        const modal = document.getElementById('deleteConfirmationModal');
        if (modal) {
          const modalBody = modal.querySelector('.modal-body');
          if (modalBody) {
            modalBody.innerHTML = `Are you sure you want to delete <strong>${itemName}</strong>? This action cannot be undone.`;
          }
          
          const confirmButton = modal.querySelector('.btn-danger');
          if (confirmButton) {
            confirmButton.onclick = function() {
              window.location.href = targetUrl;
            };
          }
          
          // Show modal
          const modalInstance = new bootstrap.Modal(modal);
          modalInstance.show();
        } else {
          // Fallback if modal is not available
          if (confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) {
            window.location.href = targetUrl;
          }
        }
      });
    });
  
    // Initialize any custom charts
    initializeCharts();
  });
  
  // Function to initialize charts
  function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      return;
    }
    
    // Set Chart.js defaults
    Chart.defaults.color = '#6c757d';
    Chart.defaults.font.family = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
    
    // Monthly Transactions Chart
    const transactionsChartEl = document.getElementById('monthlyTransactionsChart');
    if (transactionsChartEl) {
      // Try to get the chart data from a data attribute
      let chartData;
      try {
        chartData = JSON.parse(transactionsChartEl.dataset.chart);
      } catch (e) {
        console.error('Error parsing chart data:', e);
        chartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          income: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          withdrawals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };
      }
      
      new Chart(transactionsChartEl, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Income',
              data: chartData.income,
              backgroundColor: 'rgba(40, 167, 69, 0.4)',
              borderColor: 'rgba(40, 167, 69, 1)',
              borderWidth: 1
            },
            {
              label: 'Withdrawals',
              data: chartData.withdrawals,
              backgroundColor: 'rgba(255, 193, 7, 0.4)',
              borderColor: 'rgba(255, 193, 7, 1)',
              borderWidth: 1
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
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });
    }
    
    // Users Growth Chart
    const usersChartEl = document.getElementById('usersGrowthChart');
    if (usersChartEl) {
      // Try to get the chart data from a data attribute
      let chartData;
      try {
        chartData = JSON.parse(usersChartEl.dataset.chart);
      } catch (e) {
        console.error('Error parsing chart data:', e);
        chartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          users: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };
      }
      
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
              fill: true
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
              intersect: false
            }
          }
        }
      });
    }
    
    // Sales Distribution Chart (Pie)
    const salesDistChartEl = document.getElementById('salesDistributionChart');
    if (salesDistChartEl) {
      // Try to get the chart data from a data attribute
      let chartData;
      try {
        chartData = JSON.parse(salesDistChartEl.dataset.chart);
      } catch (e) {
        console.error('Error parsing chart data:', e);
        chartData = {
          labels: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Others'],
          data: [25, 20, 15, 10, 30]
        };
      }
      
      new Chart(salesDistChartEl, {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              data: chartData.data,
              backgroundColor: [
                'rgba(255, 0, 51, 0.8)',
                'rgba(40, 167, 69, 0.8)',
                'rgba(23, 162, 184, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(108, 117, 125, 0.8)'
              ],
              borderColor: [
                'rgba(255, 0, 51, 1)',
                'rgba(40, 167, 69, 1)',
                'rgba(23, 162, 184, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(108, 117, 125, 1)'
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
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${percentage}% (${value})`;
                }
              }
            }
          }
        }
      });
    }
  }
  
  // Function to load transaction data via AJAX for chart
  function loadTransactionData() {
    fetch('/admin/dashboard/api/transaction-stats')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update chart with fetched data
          updateTransactionsChart(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching transaction data:', error);
      });
  }
  
  // Function to update transactions chart with new data
  function updateTransactionsChart(chartData) {
    const chartEl = document.getElementById('monthlyTransactionsChart');
    if (!chartEl) return;
    
    const chart = Chart.getChart(chartEl);
    if (!chart) return;
    
    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.income;
    chart.data.datasets[1].data = chartData.withdrawals;
    chart.update();
  }
  
  // Handle file upload preview
  function handleFileUploadPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
  
    // Function to confirm action with a custom modal
  function confirmAction(message, callback) {
    const modal = document.getElementById('confirmActionModal');
    if (!modal) {
      // Fallback to browser confirm
      if (confirm(message)) {
        callback();
      }
      return;
    }
    
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = message;
    }
    
    const confirmButton = modal.querySelector('.btn-primary');
    if (confirmButton) {
      const oldClickHandler = confirmButton.onclick;
      confirmButton.onclick = function() {
        callback();
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Restore old click handler if it exists
        confirmButton.onclick = oldClickHandler;
      };
    }
    
    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }
  
  // Function to format currency values
  function formatCurrency(value, currency = 'Rp') {
    return currency + new Intl.NumberFormat('id-ID').format(value);
  }
  
  // Function to format dates
  function formatDate(dateString, format = 'full') {
    const date = new Date(dateString);
    
    if (format === 'full') {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else if (format === 'short') {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } else if (format === 'time') {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('id-ID');
  }
  
  // Function to initialize rich text editors if CKEditor is available
  function initRichTextEditors() {
    if (typeof ClassicEditor !== 'undefined') {
      document.querySelectorAll('.rich-text-editor').forEach(editor => {
        ClassicEditor
          .create(editor)
          .catch(error => {
            console.error('CKEditor initialization error:', error);
          });
      });
    }
  }
  
  // Function to handle bulk selection in tables
  function initBulkSelection() {
    const selectAllCheckbox = document.getElementById('selectAll');
    if (!selectAllCheckbox) return;
    
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    
    // Toggle all checkboxes when "Select All" is clicked
    selectAllCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      
      itemCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
      });
      
      // Show or hide bulk actions toolbar
      toggleBulkActionsToolbar();
    });
    
    // Check "Select All" if all items are selected, uncheck otherwise
    itemCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const allChecked = [...itemCheckboxes].every(cb => cb.checked);
        const anyChecked = [...itemCheckboxes].some(cb => cb.checked);
        
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = anyChecked && !allChecked;
        
        // Show or hide bulk actions toolbar
        toggleBulkActionsToolbar();
      });
    });
    
    // Function to show/hide bulk actions toolbar
    function toggleBulkActionsToolbar() {
      const bulkActionsToolbar = document.getElementById('bulkActionsToolbar');
      if (!bulkActionsToolbar) return;
      
      const anyChecked = [...itemCheckboxes].some(cb => cb.checked);
      
      if (anyChecked) {
        bulkActionsToolbar.classList.remove('d-none');
      } else {
        bulkActionsToolbar.classList.add('d-none');
      }
      
      // Update selected count
      const selectedCount = [...itemCheckboxes].filter(cb => cb.checked).length;
      const countElement = bulkActionsToolbar.querySelector('.selected-count');
      if (countElement) {
        countElement.textContent = selectedCount;
      }
    }
  }
  
  // Function to initialize image previews
  function initImagePreviews() {
    document.querySelectorAll('.preview-trigger').forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        
        const imageUrl = this.dataset.image || this.href;
        const title = this.dataset.title || '';
        
        // Check if modal exists, create if not
        let modal = document.getElementById('imagePreviewModal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'imagePreviewModal';
          modal.className = 'modal fade';
          modal.setAttribute('tabindex', '-1');
          modal.setAttribute('aria-hidden', 'true');
          
          modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title"></h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <img src="" class="img-fluid" alt="Preview">
                </div>
              </div>
            </div>
          `;
          
          document.body.appendChild(modal);
        }
        
        // Set modal content
        const modalTitle = modal.querySelector('.modal-title');
        const modalImage = modal.querySelector('.modal-body img');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalImage) modalImage.src = imageUrl;
        
        // Show modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
      });
    });
  }
  
  // Function to handle tab persistence using URL hash
  function initTabPersistence() {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Find the tab that matches the hash
      const tab = document.querySelector(`a[href="${hash}"]`);
      if (tab) {
        // Activate the tab
        const tabInstance = new bootstrap.Tab(tab);
        tabInstance.show();
      }
    }
    
    // Update hash when tabs are clicked
    document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
      tab.addEventListener('shown.bs.tab', function(e) {
        window.location.hash = e.target.getAttribute('href');
      });
    });
  }
  
  // Function to initialize form validation
  function initFormValidation() {
    // Check if the validation plugin is available
    if (typeof $.fn.validate === 'undefined') return;
    
    $('.needs-validation').validate({
      errorElement: 'div',
      errorClass: 'invalid-feedback',
      highlight: function(element) {
        $(element).addClass('is-invalid').removeClass('is-valid');
      },
      unhighlight: function(element) {
        $(element).removeClass('is-invalid').addClass('is-valid');
      },
      errorPlacement: function(error, element) {
        error.insertAfter(element);
      }
    });
  }
  
  // Function to initialize sortable tables
  function initSortableTables() {
    document.querySelectorAll('.sortable-table').forEach(table => {
      const headers = table.querySelectorAll('th[data-sort]');
      
      headers.forEach(header => {
        header.classList.add('sortable');
        header.insertAdjacentHTML('beforeend', '<span class="sort-icon ms-1"></span>');
        
        header.addEventListener('click', function() {
          const sortBy = this.dataset.sort;
          const isAsc = !this.classList.contains('sort-asc');
          
          // Remove sort classes from all headers
          headers.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
          });
          
          // Add sort class to clicked header
          this.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
          
          // Sort the table
          sortTable(table, sortBy, isAsc);
        });
      });
    });
    
    function sortTable(table, sortBy, isAsc) {
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      
      // Sort rows
      rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-sort-value="${sortBy}"]`)?.dataset.sortValue || 
                      a.querySelector(`td:nth-child(${getColumnIndex(table, sortBy) + 1})`)?.textContent.trim();
        
        const bValue = b.querySelector(`td[data-sort-value="${sortBy}"]`)?.dataset.sortValue || 
                      b.querySelector(`td:nth-child(${getColumnIndex(table, sortBy) + 1})`)?.textContent.trim();
        
        // Try to parse as number if possible
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return isAsc ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        return isAsc ? 
          aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' }) : 
          bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      });
      
      // Re-append rows in sorted order
      rows.forEach(row => tbody.appendChild(row));
    }
    
    function getColumnIndex(table, columnName) {
      const headers = Array.from(table.querySelectorAll('th'));
      return headers.findIndex(header => header.dataset.sort === columnName);
    }
  }
  
  // Initialize all custom scripts on document ready
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize rich text editors
    initRichTextEditors();
    
    // Initialize bulk selection
    initBulkSelection();
    
    // Initialize image previews
    initImagePreviews();
    
    // Initialize tab persistence
    initTabPersistence();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize sortable tables
    initSortableTables();
    
    // Set up date range pickers if available
    if (typeof $.fn.daterangepicker !== 'undefined') {
      $('.daterange-picker').daterangepicker({
        opens: 'left',
        locale: {
          format: 'YYYY-MM-DD'
        }
      });
    }
    
    // Initialize select2 dropdowns if available
    if (typeof $.fn.select2 !== 'undefined') {
      $('.select2').select2({
        theme: 'bootstrap4',
        width: '100%'
      });
    }
  });