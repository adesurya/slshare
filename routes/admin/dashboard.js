// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const Dashboard = require('../../models/Dashboard');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { Product, Brand } = require('../../models/Product-brand-models');

// Admin dashboard home
router.get('/', async (req, res) => {
  try {
    // Get dashboard statistics
    const stats = await Dashboard.getStatistics();
    
    // Get recent transactions
    const recentTransactions = await Dashboard.getRecentTransactions(5);
    
    // Get recent users
    const recentUsers = await Dashboard.getRecentUsers(5);
    
    // Get monthly transaction stats
    const monthlyStats = await Dashboard.getMonthlyTransactionStats();
    
    // Process monthly data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = {
      labels: months,
      income: Array(12).fill(0),
      withdrawals: Array(12).fill(0)
    };
    
    monthlyStats.forEach(stat => {
      const monthIndex = stat.month - 1; // Convert 1-based month to 0-based index
      chartData.income[monthIndex] = parseFloat(stat.income) || 0;
      chartData.withdrawals[monthIndex] = parseFloat(stat.withdrawals) || 0;
    });
    
    // Get top brands
    const topBrands = await Dashboard.getTopBrands();
    
    // Get top products
    const topProducts = await Dashboard.getTopProducts();
    
    // Get top earners
    const topEarners = await Dashboard.getTopEarners();
    
    // Get user growth stats
    const userGrowthStats = await Dashboard.getUserGrowthStats();
    
    // Process user growth data for chart
    const userGrowthData = {
      labels: months,
      users: Array(12).fill(0)
    };
    
    userGrowthStats.forEach(stat => {
      const monthIndex = stat.month - 1;
      userGrowthData.users[monthIndex] = stat.count || 0;
    });
    
    res.render('admin/dashboard/index', {
      title: 'Admin Dashboard - MOVA',
      layout: 'admin/layouts/main',
      stats,
      recentTransactions,
      recentUsers,
      chartData,
      userGrowthData,
      topBrands,
      topProducts,
      topEarners,
      section: 'dashboard'
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load dashboard: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'dashboard'
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
router.post('/settings', async (req, res) => {
  try {
    const { site_name, contact_email, default_cashback_percentage, minimum_withdrawal } = req.body;
    
    // Validate inputs
    if (!site_name || !contact_email) {
      req.session.errorMessage = 'Site name and contact email are required';
      return res.redirect('/admin/dashboard/settings');
    }
    
    // Here we would typically update settings in the database
    // For now, we'll just simulate successful settings update
    
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