// routes/admin/transactions.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAdminAuthenticated, logAdminActivity } = require('../../middlewares/adminAuth');
const Transaction = require('../../models/Transaction');
const User = require('../../models/User');
const db = require('../../config/database');

// Transactions list
router.get('/', isAdminAuthenticated, logAdminActivity('view_transactions'), async (req, res) => {
  try {
    // Get transactions with pagination
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
        SUM(CASE WHEN amount > 0 AND type = 'successful' THEN amount ELSE 0 END) as total_successful,
        SUM(CASE WHEN amount > 0 AND type = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN amount < 0 AND type = 'successful' THEN ABS(amount) ELSE 0 END) as total_withdrawals,
        COUNT(CASE WHEN amount > 0 THEN 1 END) as income_count,
        COUNT(CASE WHEN amount < 0 THEN 1 END) as withdrawal_count
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
      message: 'Failed to load transactions list',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// View transaction details
router.get('/:id', isAdminAuthenticated, logAdminActivity('view_transaction_details'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get transaction details
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
    
    // If it's a product transaction, get product details
    let product = null;
    if (transaction.reference_id && transaction.reference_id.startsWith('PROD-')) {
      const productId = transaction.reference_id.replace('PROD-', '');
      const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
      if (products.length > 0) {
        product = products[0];
      }
    }
    
    res.render('admin/transactions/details', {
      title: `Transaction #${transaction.id} - MOVA Admin`,
      layout: 'admin/layouts/main',
      transaction,
      product,
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
      message: 'Failed to load transaction details',
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
    const [transactions] = await db.execute(
      `SELECT t.*, u.username
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
    
    res.render('admin/transactions/edit', {
      title: `Edit Transaction #${transaction.id} - MOVA Admin`,
      layout: 'admin/layouts/main',
      transaction,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading transaction edit form:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load transaction edit form',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Update transaction
router.post('/:id/edit', isAdminAuthenticated, [
  body('type').isIn(['pending', 'successful']).withMessage('Invalid transaction type'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('update_transaction'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { type, description, reference_id } = req.body;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get transaction for re-rendering the form
      const [transactions] = await db.execute(
        `SELECT t.*, u.username
         FROM user_transactions t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ?`,
        [transactionId]
      );
      
      return res.render('admin/transactions/edit', {
        title: `Edit Transaction - MOVA Admin`,
        layout: 'admin/layouts/main',
        transaction: { ...transactions[0], ...req.body },
        errors: errors.array(),
        section: 'transactions'
      });
    }
    
    // Update transaction
    await db.execute(
      'UPDATE user_transactions SET type = ?, description = ?, reference_id = ? WHERE id = ?',
      [type, description, reference_id || null, transactionId]
    );
    
    req.session.successMessage = 'Transaction updated successfully';
    res.redirect(`/admin/transactions/${transactionId}`);
  } catch (error) {
    console.error('Error updating transaction:', error);
    req.session.errorMessage = 'Failed to update transaction';
    res.redirect(`/admin/transactions/${req.params.id}/edit`);
  }
});

// Delete transaction confirmation
router.get('/:id/delete', isAdminAuthenticated, logAdminActivity('view_delete_transaction'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Get transaction details
    const [transactions] = await db.execute(
      `SELECT t.*, u.username
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
    
    res.render('admin/transactions/delete', {
      title: `Delete Transaction #${transaction.id} - MOVA Admin`,
      layout: 'admin/layouts/main',
      transaction,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error loading transaction delete confirmation:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load transaction delete confirmation',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Delete transaction
router.post('/:id/delete', isAdminAuthenticated, logAdminActivity('delete_transaction'), async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { confirm } = req.body;
    
    // Confirm deletion
    if (confirm !== 'yes') {
      req.session.errorMessage = 'Transaction deletion was not confirmed';
      return res.redirect(`/admin/transactions/${transactionId}/delete`);
    }
    
    // Delete transaction
    const [result] = await db.execute(
      'DELETE FROM user_transactions WHERE id = ?',
      [transactionId]
    );
    
    if (result.affectedRows === 0) {
      req.session.errorMessage = 'Transaction not found or already deleted';
    } else {
      req.session.successMessage = 'Transaction deleted successfully';
    }
    
    res.redirect('/admin/transactions');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    req.session.errorMessage = 'Failed to delete transaction';
    res.redirect(`/admin/transactions/${req.params.id}/delete`);
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
      message: 'Failed to load new transaction form',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Create transaction
router.post('/new', isAdminAuthenticated, [
  body('user_id').isInt().withMessage('User is required'),
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('type').isIn(['pending', 'successful']).withMessage('Invalid transaction type'),
  body('description').notEmpty().withMessage('Description is required')
], logAdminActivity('create_transaction'), async (req, res) => {
  try {
    const { user_id, amount, type, description, reference_id } = req.body;
    
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
      user_id,
      amount: parseFloat(amount),
      type,
      description,
      reference_id: reference_id || null
    });
    
    req.session.successMessage = 'Transaction created successfully';
    res.redirect('/admin/transactions');
  } catch (error) {
    console.error('Error creating transaction:', error);
    req.session.errorMessage = 'Failed to create transaction';
    res.redirect('/admin/transactions/new');
  }
});

// Filter transactions by type
router.get('/filter/:type', isAdminAuthenticated, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['successful', 'pending', 'withdrawals'];
    
    if (!validTypes.includes(type)) {
      return res.redirect('/admin/transactions');
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    let query, countQuery;
    
    if (type === 'withdrawals') {
      // Get withdrawal transactions (negative amounts with successful type)
      query = `
        SELECT t.*, u.username 
        FROM user_transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.amount < 0 AND t.type = 'successful'
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countQuery = `
        SELECT COUNT(*) as count
        FROM user_transactions
        WHERE amount < 0 AND type = 'successful'
      `;
    } else {
      // Get transactions by type (pending or successful)
      query = `
        SELECT t.*, u.username 
        FROM user_transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.type = ? AND t.amount > 0
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countQuery = `
        SELECT COUNT(*) as count
        FROM user_transactions
        WHERE type = ? AND amount > 0
      `;
    }
    
    // Get transactions
    const [transactions] = type === 'withdrawals' 
      ? await db.query(query)
      : await db.execute(query, [type]);
    
    // Count total filtered transactions for pagination
    const [countResult] = type === 'withdrawals'
      ? await db.query(countQuery)
      : await db.execute(countQuery, [type]);
    
    const totalTransactions = countResult[0].count;
    const totalPages = Math.ceil(totalTransactions / limit);
    
    res.render('admin/transactions/filtered', {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Transactions - MOVA Admin`,
      layout: 'admin/layouts/main',
      transactions,
      filterType: type,
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
      message: 'Failed to load filtered transactions',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Search transactions
router.get('/search', isAdminAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.redirect('/admin/transactions');
    }
    
    // Search transactions by user, description, or reference
    const [transactions] = await db.execute(
      `SELECT t.*, u.username 
       FROM user_transactions t
       JOIN users u ON t.user_id = u.id
       WHERE u.username LIKE ? OR t.description LIKE ? OR t.reference_id LIKE ?
       ORDER BY t.created_at DESC
       LIMIT 100`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    
    res.render('admin/transactions/search', {
      title: 'Transaction Search Results - MOVA Admin',
      layout: 'admin/layouts/main',
      transactions,
      searchTerm: q,
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to search transactions',
      layout: 'admin/layouts/main',
      section: 'transactions'
    });
  }
});

// Generate transaction report 
router.get('/report', isAdminAuthenticated, logAdminActivity('generate_transaction_report'), async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;
    
    // Validate dates
    if (!start_date || !end_date) {
      return res.render('admin/transactions/report', {
        title: 'Generate Transaction Report - MOVA Admin',
        layout: 'admin/layouts/main',
        section: 'transactions',
        errors: [{ msg: 'Please select start and end dates' }]
      });
    }
    
    // Prepare query
    let queryParams = [start_date, end_date];
    let typeCondition = '';
    
    if (type && type !== 'all') {
      if (type === 'withdrawals') {
        typeCondition = 'AND t.amount < 0 AND t.type = "successful"';
      } else {
        typeCondition = 'AND t.type = ? AND t.amount > 0';
        queryParams.push(type);
      }
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
    let totalSuccessful = 0;
    let totalPending = 0;
    let totalWithdrawals = 0;
    
    transactions.forEach(t => {
      if (t.amount > 0 && t.type === 'successful') {
        totalSuccessful += parseFloat(t.amount);
      } else if (t.amount > 0 && t.type === 'pending') {
        totalPending += parseFloat(t.amount);
      } else if (t.amount < 0 && t.type === 'successful') {
        totalWithdrawals += Math.abs(parseFloat(t.amount));
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
        successful: totalSuccessful,
        pending: totalPending,
        withdrawals: totalWithdrawals,
        net: totalSuccessful - totalWithdrawals
      },
      section: 'transactions'
    });
  } catch (error) {
    console.error('Error generating transaction report:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to generate transaction report',
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