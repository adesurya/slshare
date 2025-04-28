// models/Transaction.js
const db = require('../config/database');

class Transaction {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_transactions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding transactions by user id:', error);
      throw error;
    }
  }

  static async findByUserIdAndType(userId, transactionType, status = null) {
    try {
      let query = 'SELECT * FROM user_transactions WHERE user_id = ? AND transaction_type = ?';
      let params = [userId, transactionType];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding transactions by user id and type:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_transactions WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding transaction by id:', error);
      throw error;
    }
  }

  static async create(transactionData) {
    try {
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // Get current user balance
        const [balances] = await conn.execute(
          'SELECT * FROM user_balances WHERE user_id = ?',
          [transactionData.user_id]
        );
        
        let balanceBefore = 0;
        
        // If user has no balance record yet, create one with zero balance
        if (balances.length === 0) {
          await conn.execute(
            'INSERT INTO user_balances (user_id, available_balance, pending_balance, total_earned, total_withdrawn) VALUES (?, 0, 0, 0, 0)',
            [transactionData.user_id]
          );
        } else {
          balanceBefore = balances[0].available_balance;
        }
        
        // Calculate balance after
        let balanceAfter = balanceBefore;
        
        if (transactionData.transaction_type === 'withdrawal') {
          // For withdrawals, we subtract from available balance
          balanceAfter = balanceBefore - Math.abs(transactionData.amount);
          
          // Check if user has sufficient balance
          if (balanceAfter < 0) {
            throw new Error('Insufficient balance for withdrawal');
          }
        } else if (transactionData.status === 'completed') {
          // For other completed transactions, add to available balance
          balanceAfter = balanceBefore + transactionData.amount;
        }
        
        // Create transaction record
        const [result] = await conn.execute(
          `INSERT INTO user_transactions 
           (user_id, amount, transaction_type, status, reference_id, reference_type, description, balance_before, balance_after) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionData.user_id,
            transactionData.amount,
            transactionData.transaction_type,
            transactionData.status || 'pending',
            transactionData.reference_id || null,
            transactionData.reference_type || null,
            transactionData.description || null,
            balanceBefore,
            balanceAfter
          ]
        );
        
        // Update user balance if the transaction is completed
        if (transactionData.status === 'completed') {
          if (transactionData.transaction_type === 'withdrawal') {
            // For withdrawals, update available balance and total withdrawn
            await conn.execute(
              `UPDATE user_balances 
               SET available_balance = available_balance - ?, 
                   total_withdrawn = total_withdrawn + ? 
               WHERE user_id = ?`,
              [Math.abs(transactionData.amount), Math.abs(transactionData.amount), transactionData.user_id]
            );
          } else {
            // For other transactions, update available balance and total earned
            await conn.execute(
              `UPDATE user_balances 
               SET available_balance = available_balance + ?, 
                   total_earned = total_earned + ? 
               WHERE user_id = ?`,
              [transactionData.amount, transactionData.amount, transactionData.user_id]
            );
          }
        } else if (transactionData.status === 'pending' && transactionData.transaction_type !== 'withdrawal') {
          // For pending non-withdrawal transactions, update pending balance
          await conn.execute(
            `UPDATE user_balances 
             SET pending_balance = pending_balance + ? 
             WHERE user_id = ?`,
            [transactionData.amount, transactionData.user_id]
          );
        }
        
        await conn.commit();
        return result.insertId;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async updateStatus(id, newStatus) {
    try {
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // Get transaction
        const [transactions] = await conn.execute(
          'SELECT * FROM user_transactions WHERE id = ?',
          [id]
        );
        
        if (transactions.length === 0) {
          throw new Error('Transaction not found');
        }
        
        const transaction = transactions[0];
        const oldStatus = transaction.status;
        
        // Skip if status hasn't changed
        if (oldStatus === newStatus) {
          await conn.commit();
          return true;
        }
        
        // Update transaction status
        await conn.execute(
          'UPDATE user_transactions SET status = ?, updated_at = NOW() WHERE id = ?',
          [newStatus, id]
        );
        
        // Handle balance updates based on status change
        if (transaction.transaction_type === 'withdrawal') {
          // Withdrawal transaction status updates
          if (oldStatus === 'pending' && newStatus === 'completed') {
            // Pending to completed: Move from available balance to total withdrawn
            await conn.execute(
              `UPDATE user_balances 
               SET available_balance = available_balance - ?, 
                   total_withdrawn = total_withdrawn + ? 
               WHERE user_id = ?`,
              [Math.abs(transaction.amount), Math.abs(transaction.amount), transaction.user_id]
            );
          } else if (oldStatus === 'pending' && newStatus === 'failed') {
            // Pending to failed: No balance change needed as we don't reserve funds for pending withdrawals
          } else if (oldStatus === 'completed' && newStatus === 'failed') {
            // Completed to failed: Refund the withdrawal amount
            await conn.execute(
              `UPDATE user_balances 
               SET available_balance = available_balance + ?, 
                   total_withdrawn = total_withdrawn - ? 
               WHERE user_id = ?`,
              [Math.abs(transaction.amount), Math.abs(transaction.amount), transaction.user_id]
            );
          }
        } else {
          // Non-withdrawal transaction status updates
          if (oldStatus === 'pending' && newStatus === 'completed') {
            // Pending to completed: Move from pending to available balance
            await conn.execute(
              `UPDATE user_balances 
               SET pending_balance = pending_balance - ?, 
                   available_balance = available_balance + ? 
               WHERE user_id = ?`,
              [transaction.amount, transaction.amount, transaction.user_id]
            );
          } else if (oldStatus === 'pending' && newStatus === 'failed') {
            // Pending to failed: Remove from pending balance
            await conn.execute(
              `UPDATE user_balances 
               SET pending_balance = pending_balance - ? 
               WHERE user_id = ?`,
              [transaction.amount, transaction.user_id]
            );
          } else if (oldStatus === 'completed' && newStatus === 'failed') {
            // Completed to failed: Remove from available balance and total earned
            await conn.execute(
              `UPDATE user_balances 
               SET available_balance = available_balance - ?, 
                   total_earned = total_earned - ? 
               WHERE user_id = ?`,
              [transaction.amount, transaction.amount, transaction.user_id]
            );
          }
        }
        
        await conn.commit();
        return true;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  static async getBalance(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_balances WHERE user_id = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        // If no balance record found, return default values
        return {
          available: 0,
          pending: 0,
          total_earned: 0,
          total_withdrawn: 0
        };
      }
      
      return {
        available: rows[0].available_balance,
        pending: rows[0].pending_balance,
        total_earned: rows[0].total_earned,
        total_withdrawn: rows[0].total_withdrawn
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  static async getTopEarners(limit = 5) {
    try {
      const [rows] = await db.query(
        `SELECT u.id, u.username, u.profile_image, ub.total_earned 
         FROM users u 
         JOIN user_balances ub ON u.id = ub.user_id 
         ORDER BY ub.total_earned DESC 
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting top earners:', error);
      throw error;
    }
  }

  static async getSummaryStats() {
    try {
      const [rows] = await db.query(`
        SELECT 
          SUM(CASE WHEN transaction_type IN ('cashback', 'referral_bonus', 'order_refund') AND status = 'completed' THEN amount ELSE 0 END) as total_earnings,
          SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN ABS(amount) ELSE 0 END) as total_withdrawals,
          COUNT(CASE WHEN transaction_type = 'cashback' AND status = 'completed' THEN 1 END) as cashback_count,
          COUNT(CASE WHEN transaction_type = 'referral_bonus' AND status = 'completed' THEN 1 END) as referral_count,
          COUNT(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN 1 END) as withdrawal_count
        FROM user_transactions
      `);
      
      return rows[0];
    } catch (error) {
      console.error('Error getting summary stats:', error);
      throw error;
    }
  }
}

module.exports = Transaction;