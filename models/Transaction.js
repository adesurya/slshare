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

  static async findByUserIdAndType(userId, type) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_transactions WHERE user_id = ? AND type = ? ORDER BY created_at DESC',
        [userId, type]
      );
      return rows;
    } catch (error) {
      console.error('Error finding transactions by user id and type:', error);
      throw error;
    }
  }

  static async create(transactionData) {
    try {
      const [result] = await db.execute(
        'INSERT INTO user_transactions (user_id, amount, type, description, reference_id) VALUES (?, ?, ?, ?, ?)',
        [
          transactionData.user_id,
          transactionData.amount,
          transactionData.type,
          transactionData.description || null,
          transactionData.reference_id || null
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async getBalance(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT SUM(CASE WHEN type = "successful" THEN amount ELSE 0 END) AS total_successful, ' +
        'SUM(CASE WHEN type = "pending" THEN amount ELSE 0 END) AS total_pending ' +
        'FROM user_transactions WHERE user_id = ?',
        [userId]
      );
      
      return {
        successful: rows[0].total_successful || 0,
        pending: rows[0].total_pending || 0,
        total: (rows[0].total_successful || 0) + (rows[0].total_pending || 0)
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  static async getTopEarners(limit = 5) {
    try {
      const [rows] = await db.execute(
        'SELECT u.id, u.username, u.profile_image, ' +
        'SUM(CASE WHEN t.type = "successful" THEN t.amount ELSE 0 END) AS total_earnings ' +
        'FROM users u ' +
        'JOIN user_transactions t ON u.id = t.user_id ' +
        'GROUP BY u.id ' +
        'ORDER BY total_earnings DESC ' +
        'LIMIT ?',
        [limit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting top earners:', error);
      throw error;
    }
  }
}

module.exports = Transaction;