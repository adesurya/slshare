// routes/admin/transactions.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const Transaction = require('../../models/Transaction');
const UserBalance = require('../../models/UserBalance');
const User = require('../../models/User');
const db = require('../../config/database');

// Transactions list
router.get('/', isAdminAuthenticated, logAdminActivity('view_transactions'), async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get transactions
    const [transactions] = await db.query(
      `SELECT t.*, u.username 
       FROM user_transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    );
    
    // Count total transactions for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM user_transactions');
    const totalTransactions = countResult[0].count;
    const totalPages = Math.ceil(totalTransactions / limit);
    
    // Get transaction summary
    const [summary] = await db.execute(`
      SELECT 
        SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus', 'order_refund') AND status = 'completed' THEN amount ELSE 0 END) as total_earnings,
        SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus', 'order_refund') AND status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as total_withdrawals,
        COUNT(CASE WHEN transaction_type != 'withdrawal' THEN 1 END) as income_count,
        COUNT(CASE WHEN transaction_type = 'withdrawal' THEN 1 END) as withdrawal_count
      FROM user_transactions
    `);
    
    res.render('admin/transactions/index', {
      title: 'Manage Transactions - MOVA Admin',
      layout: 'admin/layouts/main',
      transactions,
      summary: summary[0],
      pagination: {
        page,
        limit,
        totalTransactions,
        totalPages
      },
      section: 'transactions',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading admin transactions page:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load transactions list: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// View transaction details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_transaction_details'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get transaction details with user information
    const [transactions] = await db.execute(
      `SELECT t.*, u.username, u.email, u.full_name
       FROM user_transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [transactionId]
    );
    
    if (transactions.length === 0) {
      return res.status(404).render('admin/error', {
        title: 'Transaction Not Found',
        message: 'The transaction you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'transactions'
      });
    }
    
    const transaction = transactions[0];
    
    // Get additional data based on reference type
    let relatedData = null;
    
    if (transaction.reference_type === 'order' && transaction.reference_id) {
      // Get order details if reference is an order
      const [orders] = await db.execute(
        `SELECT o.* FROM orders o WHERE o.id = ? OR o.order_number = ?`,
        [
          transaction.reference_id.replace('ORD-', ''), 
          transaction.reference_id.replace('ORD-', '')
        ]
      );
      
      if (orders.length > 0) {
        relatedData = {
          type: 'order',
          data: orders[0]
        };
      }
    } else if (transaction.reference_type === 'withdrawal' && transaction.reference_id) {
      // Get withdrawal details if reference is a withdrawal
      const [withdrawals] = await db.execute(
        `SELECT w.*, m.method_type, 
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.bank_name
                  WHEN m.method_type = 'e_wallet' THEN m.ewallet_provider
                END as provider_name,
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.account_number
                  WHEN m.method_type = 'e_wallet' THEN m.phone_number
                END as account_identifier
         FROM user_withdrawals w
         JOIN user_withdrawal_methods m ON w.withdrawal_method_id = m.id
         WHERE w.id = ? OR w.reference_id = ?`,
        [
          transaction.reference_id.replace('WDR-', ''),
          transaction.reference_id.replace('WDR-', '')
        ]
      );
      
      if (withdrawals.length > 0) {
        relatedData = {
          type: 'withdrawal',
          data: withdrawals[0]
        };
      }
    }
    
    // Get user balance
    const userBalance = await UserBalance.findByUserId(transaction.user_id);
    
    res.render('admin/transactions/details', {
      title: `Transaction #${transaction.id} - MOVA Admin`,
      layout: 'admin/layouts/main',
      transaction,
      relatedData,
      userBalance,
      section: 'transactions',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading transaction details:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load transaction details: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Edit transaction form
router.get('/:id/edit', isAdminAuthenticated, logAdminActivity('view_edit_transaction'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get transaction details
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).render('admin/error', {
        title: 'Transaction Not Found',
        message: 'The transaction you requested could not be found',
        layout: 'admin/layouts/main',
        section: 'transactions'
      });
    }
    
    // Get user details
    const user = await User.findById(transaction.user_id);
    
    res.render('admin/transactions/edit', {
      title: `Edit Transaction #${transaction.id} - MOVA Admin`,
      layout: 'admin/layouts/main',
      transaction,
      user,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading transaction edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load transaction edit form: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Update transaction
router.post('/:id/edit', isAdminAuthenticated, [
  body('status').isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid transaction status'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('update_transaction'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { status, description } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get transaction for re-rendering the form
      const transaction = await Transaction.findById(transactionId);
      const user = await User.findById(transaction.user_id);
      
      return res.render('admin/transactions/edit', {
        title: `Edit Transaction - MOVA Admin`,
        layout: 'admin/layouts/main',
        transaction: { ...transaction, ...req.body },
        user,
        errors: errors.array(),
        section: 'transactions'
      });
    }
    
    // Get current transaction to check status change
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      req.session.errorMessage = 'Transaction not found';
      return res.redirect('/admin/transactions');
    }
    
    // Update basic transaction details
    await db.execute(
      'UPDATE user_transactions SET description = ? WHERE id = ?',
      [description, transactionId]
    );
    
    // If status has changed, use Transaction model to handle balance updates
    if (status !== transaction.status) {
      await Transaction.updateStatus(transactionId, status);
    }
    
    req.session.successMessage = 'Transaction updated successfully';
    res.redirect(`/admin/transactions/${transactionId}`);
  } catch (error) {
    console.error('Error updating transaction:', error);
    req.session.errorMessage = 'Failed to update transaction: ' + error.message;
    res.redirect(`/admin/transactions/${req.params.id}/edit`);
  }
});

// Add new transaction form
router.get('/new', isAdminAuthenticated, logAdminActivity('view_new_transaction'), async (req, res) => {
  try {
    // Get users for dropdown
    const [users] = await db.execute(
      'SELECT id, username, email FROM users ORDER BY username ASC'
    );
    
    res.render('admin/transactions/new', {
      title: 'Add New Transaction - MOVA Admin',
      layout: 'admin/layouts/main',
      users,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading new transaction form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load new transaction form: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Create transaction
router.post('/new', isAdminAuthenticated, [
  body('user_id').isInt().withMessage('User is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('transaction_type').isIn(['cashback', 'referral_bonus', 'adjustment', 'order_refund']).withMessage('Invalid transaction type'),
  body('status').isIn(['pending', 'completed']).withMessage('Invalid status'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('create_transaction'), async (req, res) => {
  try {
    const { user_id, amount, transaction_type, status, description, reference_id, reference_type } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get users for dropdown
      const [users] = await db.execute(
        'SELECT id, username, email FROM users ORDER BY username ASC'
      );
      
      return res.render('admin/transactions/new', {
        title: 'Add New Transaction - MOVA Admin',
        layout: 'admin/layouts/main',
        users,
        formData: req.body,
        errors: errors.array(),
        section: 'transactions'
      });
    }
    
    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      // Get users for dropdown
      const [users] = await db.execute(
        'SELECT id, username, email FROM users ORDER BY username ASC'
      );
      
      return res.render('admin/transactions/new', {
        title: 'Add New Transaction - MOVA Admin',
        layout: 'admin/layouts/main',
        users,
        formData: req.body,
        errors: [{ msg: 'Selected user does not exist' }],
        section: 'transactions'
      });
    }
    
    // Create transaction
    await Transaction.create({
      user_id: parseInt(user_id),
      amount: parseFloat(amount),
      transaction_type,
      status,
      reference_id: reference_id || null,
      reference_type: reference_type || null,
      description
    });
    
    req.session.successMessage = 'Transaction created successfully';
    res.redirect('/admin/transactions');
  } catch (error) {
    console.error('Error creating transaction:', error);
    req.session.errorMessage = 'Failed to create transaction: ' + error.message;
    res.redirect('/admin/transactions/new');
  }
});

// Filter transactions by type
router.get('/filter/:type', isAdminAuthenticated, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['cashback', 'referral_bonus', 'withdrawal', 'adjustment', 'order_refund'];
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    
    // Check if type parameter is a transaction_type or status
    const isStatus = validStatuses.includes(type);
    const isType = validTypes.includes(type);
    
    if (!isType && !isStatus) {
      return res.redirect('/admin/transactions');
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    let query, countQuery, queryParams = [];
    
    if (isType) {
      // Filter by transaction_type
      query = `
        SELECT t.*, u.username 
        FROM user_transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.transaction_type = ?
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countQuery = `
        SELECT COUNT(*) as count
        FROM user_transactions
        WHERE transaction_type = ?
      `;
      
      queryParams.push(type);
    } else {
      // Filter by status
      query = `
        SELECT t.*, u.username 
        FROM user_transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.status = ?
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countQuery = `
        SELECT COUNT(*) as count
        FROM user_transactions
        WHERE status = ?
      `;
      
      queryParams.push(type);
    }
    
    // Get transactions
    const [transactions] = await db.execute(query, queryParams);
    
    // Count total filtered transactions for pagination
    const [countResult] = await db.execute(countQuery, queryParams);
    
    const totalTransactions = countResult[0].count;
    const totalPages = Math.ceil(totalTransactions / limit);
    
    res.render('admin/transactions/filtered', {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Transactions - MOVA Admin`,
      layout: 'admin/layouts/main',
      transactions,
      filterType: type,
      isStatus,
      pagination: {
        page,
        limit,
        totalTransactions,
        totalPages
      },
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading filtered transactions:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load filtered transactions: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// User balances page
router.get('/balances', isAdminAuthenticated, logAdminActivity('view_user_balances'), async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get user balances
    const balances = await UserBalance.getAllBalances(limit, offset);
    
    // Count total users for pagination
    const [countResult] = await db.execute('SELECT COUNT(*) as count FROM user_balances');
    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Get total balances
    const totals = await UserBalance.getTotalBalances();
    
    res.render('admin/transactions/balances', {
      title: 'User Balances - MOVA Admin',
      layout: 'admin/layouts/main',
      balances,
      totals,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages
      },
      section: 'transactions',
      subsection: 'balances',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage
    });
    
    // Clear session messages
    req.session.successMessage = null;
    req.session.errorMessage = null;
  } catch (error) {
    console.error('Error loading user balances:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load user balances: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Manual balance adjustment form
router.get('/adjust-balance/:userId', isAdminAuthenticated, logAdminActivity('view_adjust_balance'), async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/admin/transactions/balances');
    }
    
    // Get user balance
    const balance = await UserBalance.findByUserId(userId);
    
    res.render('admin/transactions/adjust-balance', {
      title: `Adjust Balance for ${user.username} - MOVA Admin`,
      layout: 'admin/layouts/main',
      user,
      balance,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading balance adjustment form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load balance adjustment form: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Process balance adjustment
router.post('/adjust-balance/:userId', isAdminAuthenticated, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('adjustment_type').isIn(['add', 'subtract']).withMessage('Invalid adjustment type'),
  body('balance_type').isIn(['available', 'pending']).withMessage('Invalid balance type'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('adjust_balance'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const { amount, adjustment_type, balance_type, description } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get user and balance for re-rendering
      const user = await User.findById(userId);
      const balance = await UserBalance.findByUserId(userId);
      
      return res.render('admin/transactions/adjust-balance', {
        title: `Adjust Balance for ${user.username} - MOVA Admin`,
        layout: 'admin/layouts/main',
        user,
        balance,
        formData: req.body,
        errors: errors.array(),
        section: 'transactions'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/admin/transactions/balances');
    }
    
    // Determine the actual amount (positive or negative)
    let adjustmentAmount = parseFloat(amount);
    if (adjustment_type === 'subtract') {
      adjustmentAmount = -adjustmentAmount;
    }
    
    // Create an adjustment transaction
    await Transaction.create({
      user_id: parseInt(userId),
      amount: adjustmentAmount,
      transaction_type: 'adjustment',
      status: 'completed',
      description: `Admin balance adjustment: ${description}`
    });
    
    // Update user balance directly
    if (balance_type === 'available') {
      await UserBalance.updateAvailableBalance(userId, adjustmentAmount);
    } else {
      await UserBalance.updatePendingBalance(userId, adjustmentAmount);
    }
    
    req.session.successMessage = `Balance ${adjustment_type === 'add' ? 'increased' : 'decreased'} by ${amount} successfully`;
    res.redirect('/admin/transactions/balances');
  } catch (error) {
    console.error('Error adjusting balance:', error);
    req.session.errorMessage = 'Failed to adjust balance: ' + error.message;
    res.redirect(`/admin/transactions/adjust-balance/${req.params.userId}`);
  }
});

// Generate transaction report 
router.get('/report', isAdminAuthenticated, logAdminActivity('generate_transaction_report'), async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;
    
    // If no dates provided, render the report form
    if (!start_date || !end_date) {
      return res.render('admin/transactions/report', {
        title: 'Generate Transaction Report - MOVA Admin',
        layout: 'admin/layouts/main',
        section: 'transactions'
      });
    }
    
    // Prepare query
    let queryParams = [start_date, end_date];
    let typeCondition = '';
    
    if (type && type !== 'all') {
      typeCondition = 'AND t.transaction_type = ?';
      queryParams.push(type);
    }
    
    // Get transactions for report
    const [transactions] = await db.execute(
      `SELECT t.*, u.username 
       FROM user_transactions t
       JOIN users u ON t.user_id = u.id
       WHERE DATE(t.created_at) >= ? AND DATE(t.created_at) <= ? ${typeCondition}
       ORDER BY t.created_at DESC`,
      queryParams
    );
    
    // Calculate totals
    let totalCashback = 0;
    let totalReferrals = 0;
    let totalWithdrawals = 0;
    let totalAdjustments = 0;
    
    transactions.forEach(t => {
      if (t.transaction_type === 'cashback' && t.status === 'completed') {
        totalCashback += parseFloat(t.amount);
      } else if (t.transaction_type === 'referral_bonus' && t.status === 'completed') {
        totalReferrals += parseFloat(t.amount);
      } else if (t.transaction_type === 'withdrawal' && t.status === 'completed') {
        totalWithdrawals += Math.abs(parseFloat(t.amount));
      } else if (t.transaction_type === 'adjustment' && t.status === 'completed') {
        totalAdjustments += parseFloat(t.amount);
      }
    });
    
    res.render('admin/transactions/report-results', {
      title: 'Transaction Report - MOVA Admin',
      layout: 'admin/layouts/main',
      transactions,
      reportParams: {
        start_date,
        end_date,
        type: type || 'all'
      },
      totals: {
        cashback: totalCashback,
        referrals: totalReferrals,
        withdrawals: totalWithdrawals,
        adjustments: totalAdjustments,
        net: totalCashback + totalReferrals + totalAdjustments - totalWithdrawals
      },
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error generating transaction report:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to generate transaction report: ' + error.message,
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Render report form
router.get('/report-form', isAdminAuthenticated, (req, res) => {
  res.render('admin/transactions/report', {
    title: 'Generate Transaction Report - MOVA Admin',
    layout: 'admin/layouts/main',
    section: 'transactions'
  });
});

module.exports = router;