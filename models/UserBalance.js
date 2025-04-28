// models/UserBalance.js
const db = require('../config/database');

class UserBalance {
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_balances WHERE user_id = ?',
        [userId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user balance:', error);
      throw error;
    }
  }

  static async initialize(userId) {
    try {
      const [result] = await db.execute(
        `INSERT INTO user_balances 
         (user_id, available_balance, pending_balance, total_earned, total_withdrawn) 
         VALUES (?, 0, 0, 0, 0)
         ON DUPLICATE KEY UPDATE user_id = user_id`,
        [userId]
      );
      
      return result.insertId || userId;
    } catch (error) {
      console.error('Error initializing user balance:', error);
      throw error;
    }
  }

  static async updateAvailableBalance(userId, amount) {
    try {
      // Make sure user has a balance record
      await this.initialize(userId);
      
      const [result] = await db.execute(
        'UPDATE user_balances SET available_balance = available_balance + ? WHERE user_id = ?',
        [amount, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating available balance:', error);
      throw error;
    }
  }

  static async updatePendingBalance(userId, amount) {
    try {
      // Make sure user has a balance record
      await this.initialize(userId);
      
      const [result] = await db.execute(
        'UPDATE user_balances SET pending_balance = pending_balance + ? WHERE user_id = ?',
        [amount, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating pending balance:', error);
      throw error;
    }
  }

  static async movePendingToAvailable(userId, amount) {
    try {
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // Get current balance to verify sufficient pending funds
        const [balances] = await conn.execute(
          'SELECT * FROM user_balances WHERE user_id = ?',
          [userId]
        );
        
        if (balances.length === 0) {
          throw new Error('User balance not found');
        }
        
        const pendingBalance = balances[0].pending_balance;
        
        if (pendingBalance < amount) {
          throw new Error('Insufficient pending balance');
        }
        
        // Update balances
        await conn.execute(
          `UPDATE user_balances 
           SET pending_balance = pending_balance - ?,
               available_balance = available_balance + ?
           WHERE user_id = ?`,
          [amount, amount, userId]
        );
        
        await conn.commit();
        return true;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error moving pending to available balance:', error);
      throw error;
    }
  }

  static async getAllBalances(limit = 20, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT ub.*, u.username, u.email, u.full_name
         FROM user_balances ub
         JOIN users u ON ub.user_id = u.id
         ORDER BY ub.available_balance DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting all balances:', error);
      throw error;
    }
  }

  static async getTotalBalances() {
    try {
      const [rows] = await db.query(`
        SELECT 
          SUM(available_balance) as total_available,
          SUM(pending_balance) as total_pending,
          SUM(total_earned) as total_earned,
          SUM(total_withdrawn) as total_withdrawn,
          COUNT(*) as total_users
        FROM user_balances
      `);
      
      return rows[0];
    } catch (error) {
      console.error('Error getting total balances:', error);
      throw error;
    }
  }
}

module.exports = UserBalance;