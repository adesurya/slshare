// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const Dashboard = require('../../models/Dashboard');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { Product, Brand } = require('../../models/Product-brand-models');
const { Order } = require('../../models/Order');
const UserBalance = require('../../models/UserBalance');
const db = require('../../config/database');
const Withdrawal = require('../../models/Withdrawal');


// Admin dashboard home
router.get('/', isAdminAuthenticated, async (req, res) => {
  try {
    // Default stats structure with empty values
    let stats = {
      orders: {
        total: 0,
        total_sales: 0,
        total_cashback: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
      },
      transactions: {
        successful: 0,
        withdrawals: 0,
        new: 0
      },
      users: {
        total: 0,
        new: 0
      },
      products: {
        total: 0
      },
      brands: {
        total: 0
      }
    };

    // Empty arrays for various data
    let recentOrders = [];
    let recentTransactions = [];
    let recentUsers = [];
    let topBrands = [];
    let topProducts = [];
    let topEarners = [];
    let chartData = { labels: [], income: [], withdrawals: [] };
    let userGrowthData = { labels: [], users: [] };

    // Get order statistics
    try {
      const [orderStats] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(total_amount) as total_sales,
          SUM(cashback_amount) as total_cashback,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM orders
      `);
      
      if (orderStats && orderStats.length > 0) {
        stats.orders = {
          total: parseInt(orderStats[0].total || 0),
          total_sales: parseFloat(orderStats[0].total_sales || 0),
          total_cashback: parseFloat(orderStats[0].total_cashback || 0),
          pending: parseInt(orderStats[0].pending || 0),
          processing: parseInt(orderStats[0].processing || 0),
          completed: parseInt(orderStats[0].completed || 0),
          cancelled: parseInt(orderStats[0].cancelled || 0)
        };
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      // Continue with default values
    }

    // Get transaction statistics
    try {
      const [transactionStats] = await db.execute(`
        SELECT 
          SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus') AND status = 'completed' AND amount > 0 THEN amount ELSE 0 END) as successful,
          SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as withdrawals,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new
        FROM user_transactions
      `);
      
      if (transactionStats && transactionStats.length > 0) {
        stats.transactions = {
          successful: parseFloat(transactionStats[0].successful || 0),
          withdrawals: parseFloat(transactionStats[0].withdrawals || 0),
          new: parseInt(transactionStats[0].new || 0)
        };
      }
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      // Continue with default values
    }

    // Get user statistics
    try {
      const [userStats] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new
        FROM users
      `);
      
      if (userStats && userStats.length > 0) {
        stats.users = {
          total: parseInt(userStats[0].total || 0),
          new: parseInt(userStats[0].new || 0)
        };
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Continue with default values
    }

    // Get product and brand counts
    try {
      const [productCount] = await db.execute('SELECT COUNT(*) as total FROM products');
      const [brandCount] = await db.execute('SELECT COUNT(*) as total FROM brands');
      
      if (productCount && productCount.length > 0) {
        stats.products.total = parseInt(productCount[0].total || 0);
      }
      
      if (brandCount && brandCount.length > 0) {
        stats.brands.total = parseInt(brandCount[0].total || 0);
      }
    } catch (error) {
      console.error('Error fetching product and brand counts:', error);
      // Continue with default values
    }

    // Get chart data (monthly transactions)
    try {
      const [monthlyData] = await db.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%b %Y') as month,
          SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus') AND status = 'completed' AND amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as withdrawals
        FROM user_transactions
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b %Y')
        ORDER BY MIN(created_at)
      `);
      
      chartData = {
        labels: monthlyData.map(item => item.month),
        income: monthlyData.map(item => parseFloat(item.income || 0)),
        withdrawals: monthlyData.map(item => parseFloat(item.withdrawals || 0))
      };

      // If we don't have any data, provide empty placeholder
      if (chartData.labels.length === 0) {
        // Create placeholder data for the last 6 months
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
        }
        chartData = {
          labels: months,
          income: months.map(() => 0),
          withdrawals: months.map(() => 0)
        };
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Create placeholder data for the last 6 months if error occurs
      const months = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
      }
      chartData = {
        labels: months,
        income: months.map(() => 0),
        withdrawals: months.map(() => 0)
      };
    }

    // Get user growth data
    try {
      const [userGrowth] = await db.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%b %Y') as month,
          COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b %Y')
        ORDER BY MIN(created_at)
      `);
      
      userGrowthData = {
        labels: userGrowth.map(item => item.month),
        users: userGrowth.map(item => parseInt(item.count || 0))
      };

      // If we don't have any data, provide empty placeholder
      if (userGrowthData.labels.length === 0) {
        // Create placeholder data for the last 6 months
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
        }
        userGrowthData = {
          labels: months,
          users: months.map(() => 0)
        };
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      // Create placeholder data if error occurs
      const months = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
      }
      userGrowthData = {
        labels: months,
        users: months.map(() => 0)
      };
    }

    // Get recent orders (with username)
    try {
      const [orders] = await db.execute(`
        SELECT o.*, u.username
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      
      recentOrders = orders || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Keep as empty array
    }

    // Get recent transactions (with username)
    try {
      const [transactions] = await db.execute(`
        SELECT t.*, u.username
        FROM user_transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `);
      
      recentTransactions = transactions || [];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      // Keep as empty array
    }

    // Get recent users
    try {
      const [users] = await db.execute(`
        SELECT id, username, email, is_verified, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      recentUsers = users || [];
    } catch (error) {
      console.error('Error fetching recent users:', error);
      // Keep as empty array
    }

    // Get top brands
    try {
      const [brands] = await db.execute(`
        SELECT id, name, cashback_percentage, products_count
        FROM brands
        ORDER BY products_count DESC, cashback_percentage DESC
        LIMIT 5
      `);
      
      topBrands = brands || [];
    } catch (error) {
      console.error('Error fetching top brands:', error);
      // Keep as empty array
    }

    // Get top products
    try {
      const [products] = await db.execute(`
        SELECT id, name, price, cashback_percentage
        FROM products
        ORDER BY price DESC
        LIMIT 5
      `);
      
      topProducts = products || [];
    } catch (error) {
      console.error('Error fetching top products:', error);
      // Keep as empty array
    }

    // Get top earners
    try {
      const [earners] = await db.execute(`
        SELECT u.id, u.username, ub.total_earned as total_earnings
        FROM user_balances ub
        JOIN users u ON ub.user_id = u.id
        ORDER BY ub.total_earned DESC
        LIMIT 5
      `);
      
      topEarners = earners || [];
    } catch (error) {
      console.error('Error fetching top earners:', error);
      // Keep as empty array
    }
    
    res.render('admin/dashboard/index', {
      title: 'Admin Dashboard - MOVA',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'dashboard',
      stats,
      chartData,
      userGrowthData,
      recentOrders,
      recentTransactions,
      recentUsers,
      topBrands,
      topProducts,
      topEarners
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    // Fallback to render dashboard with default values
    const defaultStats = {
      orders: {
        total: 0,
        total_sales: 0,
        total_cashback: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
      },
      transactions: {
        successful: 0,
        withdrawals: 0,
        new: 0
      },
      users: {
        total: 0,
        new: 0
      },
      products: {
        total: 0
      },
      brands: {
        total: 0
      }
    };
    
    // Create empty chart data
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear());
    }
    
    const chartData = {
      labels: months,
      income: months.map(() => 0),
      withdrawals: months.map(() => 0)
    };
    
    const userGrowthData = {
      labels: months,
      users: months.map(() => 0)
    };
    
    res.status(500).render('admin/dashboard/index', {
      title: 'Admin Dashboard - MOVA',
      layout: 'admin/layouts/main',
      admin: req.admin,
      section: 'dashboard',
      stats: defaultStats,
      chartData,
      userGrowthData,
      recentOrders: [],
      recentTransactions: [],
      recentUsers: [],
      topBrands: [],
      topProducts: [],
      topEarners: [],
      errorMessage: 'Failed to load dashboard data: ' + error.message
    });
  }
});


// Admin system logs
router.get('/logs', async (req, res) => {
  try {
    // Get system logs
    const logs = await Dashboard.getSystemLogs(100);
    
    res.render('admin/dashboard/logs', {
      title: 'System Logs - MOVA Admin',
      layout: 'admin/layouts/main',
      logs,
      section: 'logs'
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load system logs: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'logs'
    });
  }
});

// Get transaction statistics for API
router.get('/api/transaction-stats', async (req, res) => {
  try {
    const monthlyStats = await Dashboard.getMonthlyTransactionStats();
    
    // Process monthly data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = {
      labels: months,
      income: Array(12).fill(0),
      withdrawals: Array(12).fill(0)
    };
    
    monthlyStats.forEach(stat => {
      const monthIndex = stat.month - 1;
      chartData.income[monthIndex] = parseFloat(stat.income) || 0;
      chartData.withdrawals[monthIndex] = parseFloat(stat.withdrawals) || 0;
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load transaction statistics'
    });
  }
});

// Get user growth statistics for API
router.get('/api/user-growth', async (req, res) => {
  try {
    const userGrowthStats = await Dashboard.getUserGrowthStats();
    
    // Process user growth data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = {
      labels: months,
      users: Array(12).fill(0)
    };
    
    userGrowthStats.forEach(stat => {
      const monthIndex = stat.month - 1;
      chartData.users[monthIndex] = stat.count || 0;
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error getting user growth stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user growth statistics'
    });
  }
});

// Get cashback distribution for API
router.get('/api/cashback-distribution', async (req, res) => {
  try {
    const distribution = await Dashboard.getCashbackDistribution();
    
    // Process data for chart
    const chartData = {
      labels: [],
      data: []
    };
    
    distribution.forEach(item => {
      chartData.labels.push(item.name);
      chartData.data.push(item.cashback_percentage);
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error getting cashback distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load cashback distribution'
    });
  }
});

// Admin settings page
router.get('/settings', async (req, res) => {
  try {
    // Get system stats
    const systemStats = await Dashboard.getSystemStats();
    
    res.render('admin/dashboard/settings', {
      title: 'System Settings - MOVA Admin',
      layout: 'admin/layouts/main',
      section: 'settings',
      systemStats,
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load settings page: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'settings'
    });
  }
});

// Save system settings
router.post('/settings', isAdminAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      if (key.startsWith('setting_')) {
        const settingKey = key.replace('setting_', '');
        await db.execute(
          'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
          [value, settingKey]
        );
      }
    }
    
    req.session.successMessage = 'Settings updated successfully';
    res.redirect('/admin/dashboard/settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    req.session.errorMessage = 'Failed to update settings: ' + error.message;
    res.redirect('/admin/dashboard/settings');
  }
});

// System maintenance page
router.get('/maintenance', async (req, res) => {
  try {
    res.render('admin/dashboard/maintenance', {
      title: 'System Maintenance - MOVA Admin',
      layout: 'admin/layouts/main',
      section: 'maintenance',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Admin maintenance error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load maintenance page: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'maintenance'
    });
  }
});

// Run maintenance tasks
router.post('/maintenance/run', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (task === 'sync_product_counts') {
      // Sync product counts for brands
      await db.execute('CALL sync_product_counts()');
      req.session.successMessage = 'Product counts synchronized successfully';
    } else if (task === 'cleanup_sessions') {
      // Clean up expired sessions
      await db.execute('CALL cleanup_expired_sessions()');
      req.session.successMessage = 'Expired sessions cleaned up successfully';
    } else {
      req.session.errorMessage = 'Invalid maintenance task';
    }
    
    res.redirect('/admin/dashboard/maintenance');
  } catch (error) {
    console.error('Error running maintenance task:', error);
    req.session.errorMessage = 'Failed to run maintenance task: ' + error.message;
    res.redirect('/admin/dashboard/maintenance');
  }
});

module.exports = router;