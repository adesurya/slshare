// routes/admin/orders.js
const express = require('express');
const router = express.Router();
const { isAdminAuthenticated, logAdminActivity } = require('./auth');
const { Order } = require('../../models/Order');
const db = require('../../config/database');

// Orders list page
router.get('/', isAdminAuthenticated, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get orders with pagination
    // PERBAIKAN: Konversi limit dan offset ke tipe data Number yang eksplisit
    const numLimit = Number(limit);
    const numOffset = Number(offset);
    
    // Gunakan db.query daripada db.execute untuk lebih aman dengan parameter
    const [orders] = await db.query(
      `SELECT o.*, u.username as customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [numLimit, numOffset]
    );
    
    // Get total orders count for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const totalOrders = countResult[0].count;
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Get order statistics
    const [stats] = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(total_amount) as total_sales,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM orders
    `);
    
    res.render('admin/orders/index', {
      title: 'Orders - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages
      },
      stats: stats[0],
      breadcrumb: {
        current: 'Orders'
      },
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to fetch orders: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders'
    });
  }
});

// View order details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_order'), async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details with customer info
    const [orders] = await db.execute(
      `SELECT o.*, u.username, u.email, u.full_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );
    
    if (orders.length === 0) {
      req.session.errorMessage = 'Order not found';
      return res.redirect('/admin/orders');
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.execute(
      `SELECT oi.*, p.name as product_name, p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    // Get order timeline
    const [timeline] = await db.execute(
      `SELECT * FROM order_status_history
       WHERE order_id = ?
       ORDER BY created_at DESC`,
      [orderId]
    );
    
    res.render('admin/orders/details', {
      title: `Order #${order.order_number} - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      order,
      items,
      timeline,
      breadcrumb: {
        parent: 'Orders',
        parentUrl: '/admin/orders',
        current: `Order #${order.order_number}`
      },
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to fetch order details: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders'
    });
  }
});

// Update order status
router.post('/:id/update-status', isAdminAuthenticated, logAdminActivity('update_order_status'), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      req.session.errorMessage = 'Invalid order status';
      return res.redirect(`/admin/orders/${orderId}`);
    }
    
    // Update order status
    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    // Add status history
    await db.execute(
      'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
      [orderId, status, notes || null, req.admin.id]
    );
    
    req.session.successMessage = 'Order status updated successfully';
    res.redirect(`/admin/orders/${orderId}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    req.session.errorMessage = 'Failed to update order status: ' + error.message;
    res.redirect(`/admin/orders/${req.params.id}`);
  }
});

// Create new order form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_order'), async (req, res) => {
  try {
    // Get users for select dropdown
    const [users] = await db.execute('SELECT id, username, email FROM users');
    
    // Get products for select dropdown
    const [products] = await db.execute('SELECT id, name, price FROM products');
    
    res.render('admin/orders/new', {
      title: 'Create New Order - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      users,
      products,
      breadcrumb: {
        parent: 'Orders',
        parentUrl: '/admin/orders',
        current: 'Create New Order'
      }
    });
  } catch (error) {
    console.error('Error loading new order form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load new order form: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders'
    });
  }
});

// Process new order
router.post('/new', isAdminAuthenticated, logAdminActivity('create_order'), async (req, res) => {
  try {
    const { user_id, products, quantities, status } = req.body;
    
    // Validate input
    if (!user_id || !products || !quantities) {
      return res.render('admin/orders/new', {
        title: 'Create New Order - MOVA Admin',
        layout: 'admin/layouts/main',
        admin: req.admin,
        section: 'orders',
        error: 'Please fill all required fields',
        formData: req.body,
        breadcrumb: {
          parent: 'Orders',
          parentUrl: '/admin/orders',
          current: 'Create New Order'
        }
      });
    }
    
    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Calculate total amount
      let totalAmount = 0;
      const productIds = Array.isArray(products) ? products : [products];
      const productQuantities = Array.isArray(quantities) ? quantities : [quantities];
      
      for (let i = 0; i < productIds.length; i++) {
        const [productResult] = await connection.execute(
          'SELECT price FROM products WHERE id = ?',
          [productIds[i]]
        );
        
        if (productResult.length > 0) {
          totalAmount += productResult[0].price * parseInt(productQuantities[i]);
        }
      }
      
      // Insert order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (order_number, user_id, total_amount, status, created_by) VALUES (?, ?, ?, ?, ?)',
        [orderNumber, user_id, totalAmount, status || 'pending', req.admin.id]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order items
      for (let i = 0; i < productIds.length; i++) {
        if (productIds[i] && productQuantities[i]) {
          const [productResult] = await connection.execute(
            'SELECT price FROM products WHERE id = ?',
            [productIds[i]]
          );
          
          if (productResult.length > 0) {
            const price = productResult[0].price;
            const subtotal = price * parseInt(productQuantities[i]);
            
            await connection.execute(
              'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
              [orderId, productIds[i], productQuantities[i], price, subtotal]
            );
          }
        }
      }
      
      // Add status history
      await connection.execute(
        'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
        [orderId, status || 'pending', 'Order created by admin', req.admin.id]
      );
      
      // Commit transaction
      await connection.commit();
      
      req.session.successMessage = 'Order created successfully';
      res.redirect(`/admin/orders/${orderId}`);
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).render('admin/orders/new', {
      title: 'Create New Order - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      error: 'Failed to create order: ' + error.message,
      formData: req.body,
      breadcrumb: {
        parent: 'Orders',
        parentUrl: '/admin/orders',
        current: 'Create New Order'
      }
    });
  }
});

// Filter orders by status
router.get('/status/:status', isAdminAuthenticated, async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      req.session.errorMessage = 'Invalid order status';
      return res.redirect('/admin/orders');
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get orders with pagination
    const [orders] = await db.execute(
      `SELECT o.*, u.username as customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.status = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [status, limit, offset]
    );
    
    // Get total orders count for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE status = ?',
      [status]
    );
    const totalOrders = countResult[0].count;
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.render('admin/orders/filtered', {
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} Orders - MOVA Admin`,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      orders,
      status,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages
      },
      breadcrumb: {
        parent: 'Orders',
        parentUrl: '/admin/orders',
        current: `${status.charAt(0).toUpperCase() + status.slice(1)} Orders`
      },
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to fetch filtered orders: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders'
    });
  }
});

// Search orders
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/orders');
    }
    
    // Get orders matching the search query
    const [orders] = await db.execute(
      `SELECT o.*, u.username as customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.order_number LIKE ? OR u.username LIKE ? OR u.email LIKE ?
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    
    res.render('admin/orders/search', {
      title: 'Order Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders',
      orders,
      searchTerm: q,
      breadcrumb: {
        parent: 'Orders',
        parentUrl: '/admin/orders',
        current: 'Search Results'
      }
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search orders: ' + error.message,
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'orders'
    });
  }
});

// Export router
module.exports = router;