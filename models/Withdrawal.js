// models/Withdrawal.js
const db = require('../config/database');

class Withdrawal {
  static async findAll(limit = 20, offset = 0) {
    try {
      // Convert to numbers to ensure correct data type
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Use query instead of execute for LIMIT and OFFSET params
      const [withdrawals] = await db.query(
        `SELECT w.*, u.username, u.email, m.method_type, 
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.bank_name
                  WHEN m.method_type = 'e_wallet' THEN m.ewallet_provider
                END as provider_name,
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.account_number
                  WHEN m.method_type = 'e_wallet' THEN m.phone_number
                END as account_identifier,
                t.status as transaction_status
         FROM user_withdrawals w
         JOIN users u ON w.user_id = u.id
         JOIN user_withdrawal_methods m ON w.withdrawal_method_id = m.id
         LEFT JOIN user_transactions t ON w.transaction_id = t.id
         ORDER BY w.created_at DESC
         LIMIT ? OFFSET ?`,
        [numLimit, numOffset]
      );
      return withdrawals;
    } catch (error) {
      console.error('Error finding all withdrawals:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [withdrawals] = await db.execute(
        `SELECT w.*, u.username, u.email, m.method_type, 
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.bank_name
                  WHEN m.method_type = 'e_wallet' THEN m.ewallet_provider
                END as provider_name,
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.account_number
                  WHEN m.method_type = 'e_wallet' THEN m.phone_number
                END as account_identifier,
                t.status as transaction_status,
                t.description as transaction_description,
                t.created_at as transaction_created_at,
                t.updated_at as transaction_updated_at
         FROM user_withdrawals w
         JOIN users u ON w.user_id = u.id
         JOIN user_withdrawal_methods m ON w.withdrawal_method_id = m.id
         LEFT JOIN user_transactions t ON w.transaction_id = t.id
         WHERE w.id = ?`,
        [id]
      );
      
      return withdrawals.length ? withdrawals[0] : null;
    } catch (error) {
      console.error('Error finding withdrawal by id:', error);
      throw error;
    }
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      // Convert to numbers to ensure correct data type
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Use query instead of execute for LIMIT and OFFSET params
      const [withdrawals] = await db.query(
        `SELECT w.*, m.method_type, 
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.bank_name
                  WHEN m.method_type = 'e_wallet' THEN m.ewallet_provider
                END as provider_name,
                t.status as transaction_status
         FROM user_withdrawals w
         JOIN user_withdrawal_methods m ON w.withdrawal_method_id = m.id
         LEFT JOIN user_transactions t ON w.transaction_id = t.id
         WHERE w.user_id = ?
         ORDER BY w.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, numLimit, numOffset]
      );
      
      return withdrawals;
    } catch (error) {
      console.error('Error finding withdrawals by user id:', error);
      throw error;
    }
  }

  static async request(withdrawalData) {
    try {
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();
        
        // Check if user has sufficient balance
        const [balances] = await conn.execute(
          'SELECT available_balance FROM user_balances WHERE user_id = ?',
          [withdrawalData.user_id]
        );
        
        if (balances.length === 0 || balances[0].available_balance < withdrawalData.amount) {
          throw new Error('Insufficient balance for withdrawal');
        }
        
        // Check if withdrawal method exists and belongs to user
        const [methods] = await conn.execute(
          'SELECT * FROM user_withdrawal_methods WHERE id = ? AND user_id = ?',
          [withdrawalData.withdrawal_method_id, withdrawalData.user_id]
        );
        
        if (methods.length === 0) {
          throw new Error('Invalid withdrawal method');
        }
        
        // Generate reference ID if not provided
        const referenceId = withdrawalData.reference_id || 
          `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Create withdrawal record
        const [result] = await conn.execute(
          `INSERT INTO user_withdrawals 
           (user_id, withdrawal_method_id, amount, fee, status, reference_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            withdrawalData.user_id,
            withdrawalData.withdrawal_method_id,
            withdrawalData.amount,
            withdrawalData.fee || 0,
            'pending',
            referenceId
          ]
        );
        
        const withdrawalId = result.insertId;
        
        // Create pending transaction record
        const [txResult] = await conn.execute(
          `INSERT INTO user_transactions 
           (user_id, amount, transaction_type, status, reference_id, reference_type, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            withdrawalData.user_id,
            -withdrawalData.amount, // Negative amount for withdrawal
            'withdrawal',
            'pending',
            referenceId,
            'withdrawal',
            'Withdrawal request processing'
          ]
        );
        
        const transactionId = txResult.insertId;
        
        // Link transaction to withdrawal
        await conn.execute(
          'UPDATE user_withdrawals SET transaction_id = ? WHERE id = ?',
          [transactionId, withdrawalId]
        );
        
        await conn.commit();
        return withdrawalId;
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  }

  static async updateStatus(id, newStatus, notes) {
    try {
      // Use our stored procedure to process the withdrawal
      await db.execute(
        'CALL process_withdrawal_request(?, ?, ?)',
        [id, newStatus, notes || null]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      throw error;
    }
  }

  static async getMonthlyStats() {
    try {
      const [rows] = await db.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as withdrawal_count,
          SUM(amount) as total_amount,
          SUM(fee) as total_fees,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
        FROM user_withdrawals
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      throw error;
    }
  }

  static async search(query) {
    try {
      const searchPattern = `%${query}%`;
      
      const [withdrawals] = await db.execute(
        `SELECT w.*, u.username, u.email, m.method_type, 
                CASE 
                  WHEN m.method_type = 'bank_transfer' THEN m.bank_name
                  WHEN m.method_type = 'e_wallet' THEN m.ewallet_provider
                END as provider_name
         FROM user_withdrawals w
         JOIN users u ON w.user_id = u.id
         JOIN user_withdrawal_methods m ON w.withdrawal_method_id = m.id
         WHERE w.reference_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?
         ORDER BY w.created_at DESC
         LIMIT 50`,
        [searchPattern, searchPattern, searchPattern]
      );
      
      return withdrawals;
    } catch (error) {
      console.error('Error searching withdrawals:', error);
      throw error;
    }
  }
}

module.exports = Withdrawal;