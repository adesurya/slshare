// models/Dashboard.js
const db = require('../config/database');

class Dashboard {
  // Get dashboard statistics
  static async getStatistics() {
    try {
      // Get total users count
      const [usersCount] = await db.execute(
        'SELECT COUNT(*) as count FROM users'
      );
      
      // Get total brands count
      const [brandsCount] = await db.execute(
        'SELECT COUNT(*) as count FROM brands'
      );
      
      // Get total products count
      const [productsCount] = await db.execute(
        'SELECT COUNT(*) as count FROM products'
      );
      
      // Get total successful transactions amount
      const [transactionsTotal] = await db.execute(
        'SELECT SUM(amount) as total FROM user_transactions WHERE type = "successful" AND amount > 0'
      );
      
      // Get pending transactions amount
      const [pendingTotal] = await db.execute(
        'SELECT SUM(amount) as total FROM user_transactions WHERE type = "pending"'
      );
      
      // Get total withdrawals amount
      const [withdrawalsTotal] = await db.execute(
        'SELECT SUM(ABS(amount)) as total FROM user_transactions WHERE amount < 0 AND type = "successful"'
      );
      
      // Get new users in the last 7 days
      const [newUsers] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
      );
      
      // Get new transactions in the last 7 days
      const [newTransactions] = await db.execute(
        'SELECT COUNT(*) as count FROM user_transactions WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
      );
      
      return {
        users: {
          total: usersCount[0].count || 0,
          new: newUsers[0].count || 0
        },
        brands: {
          total: brandsCount[0].count || 0
        },
        products: {
          total: productsCount[0].count || 0
        },
        transactions: {
          successful: transactionsTotal[0].total || 0,
          pending: pendingTotal[0].total || 0,
          withdrawals: withdrawalsTotal[0].total || 0,
          new: newTransactions[0].count || 0
        }
      };
    } catch (error) {
      console.error('Error getting dashboard statistics:', error);
      // Return default values on error to prevent application from crashing
      return {
        users: { total: 0, new: 0 },
        brands: { total: 0 },
        products: { total: 0 },
        transactions: { successful: 0, pending: 0, withdrawals: 0, new: 0 }
      };
    }
  }
  
  // Get recent transactions
  static async getRecentTransactions(limit = 10) {
    try {
      const [rows] = await db.query(
        `SELECT t.*, u.username 
         FROM user_transactions t
         JOIN users u ON t.user_id = u.id
         ORDER BY t.created_at DESC
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }
  
  // Get recent user registrations
  static async getRecentUsers(limit = 10) {
    try {
      const [rows] = await db.query(
        `SELECT id, username, email, full_name, created_at, is_verified 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  }
  
  // Get monthly transaction stats for the current year
  static async getMonthlyTransactionStats() {
    try {
      const [rows] = await db.execute(
        `SELECT 
          MONTH(created_at) as month,
          SUM(CASE WHEN amount > 0 AND type = 'successful' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 AND type = 'successful' THEN ABS(amount) ELSE 0 END) as withdrawals
         FROM user_transactions
         WHERE YEAR(created_at) = YEAR(CURDATE())
         GROUP BY MONTH(created_at)
         ORDER BY month ASC`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting monthly transaction stats:', error);
      return [];
    }
  }
  
  // Get top brands by transaction volume
  static async getTopBrands(limit = 5) {
    try {
      // This query is a simplified version since the actual data model may vary
      const [rows] = await db.query(
        `SELECT b.id, b.name, b.logo_url, b.products_count, b.cashback_percentage
         FROM brands b
         ORDER BY b.products_count DESC, b.priority DESC
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting top brands:', error);
      return [];
    }
  }
  
  // Get top products by view count or any other metric
  static async getTopProducts(limit = 5) {
    try {
      const [rows] = await db.query(
        `SELECT p.id, p.name, p.image_url, p.brand, p.price, p.cashback_percentage
         FROM products p
         ORDER BY p.price DESC
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }
  
  // Get top users by earnings
  static async getTopEarners(limit = 5) {
    try {
      // Using a simpler query since we don't know the exact table structure
      const [rows] = await db.query(
        `SELECT u.id, u.username, u.profile_image, 
         (SELECT SUM(amount) FROM user_transactions WHERE user_id = u.id AND type = 'successful' AND amount > 0) as total_earnings
         FROM users u
         WHERE (SELECT SUM(amount) FROM user_transactions WHERE user_id = u.id AND type = 'successful' AND amount > 0) > 0
         ORDER BY total_earnings DESC
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting top earners:', error);
      return [];
    }
  }
  
  // Get system activity logs
  static async getSystemLogs(limit = 20) {
    try {
      // Check if admin_activity_logs table exists
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'admin_activity_logs'"
      );
      
      // If the table doesn't exist, return empty array
      if (tables.length === 0) {
        return [];
      }
      
      const [rows] = await db.query(
        `SELECT al.*, COALESCE(au.username, 'System') as username
         FROM admin_activity_logs al
         LEFT JOIN admin_users au ON al.admin_id = au.id
         ORDER BY al.created_at DESC
         LIMIT ${Number(limit)}`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting system logs:', error);
      return [];
    }
  }
  
  // Get user growth statistics by month
  static async getUserGrowthStats() {
    try {
      const [rows] = await db.execute(
        `SELECT 
          MONTH(created_at) as month,
          COUNT(*) as count
         FROM users
         WHERE YEAR(created_at) = YEAR(CURDATE())
         GROUP BY MONTH(created_at)
         ORDER BY month ASC`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting user growth stats:', error);
      return [];
    }
  }
  
  // Get cashback distribution by brand
  static async getCashbackDistribution() {
    try {
      const [rows] = await db.execute(
        `SELECT 
          b.name,
          b.cashback_percentage
         FROM brands b
         ORDER BY b.cashback_percentage DESC
         LIMIT 10`
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting cashback distribution:', error);
      return [];
    }
  }
  
  // Get system statistics
  static async getSystemStats() {
    try {
      // Get total transactions count
      const [transactionsCount] = await db.execute(
        'SELECT COUNT(*) as count FROM user_transactions'
      );
      
      // Get successful withdrawal count
      const [withdrawalsCount] = await db.execute(
        'SELECT COUNT(*) as count FROM user_transactions WHERE amount < 0 AND type = "successful"'
      );
      
      // Get pending transactions count
      const [pendingCount] = await db.execute(
        'SELECT COUNT(*) as count FROM user_transactions WHERE type = "pending"'
      );
      
      return {
        transactions_count: transactionsCount[0].count || 0,
        withdrawals_count: withdrawalsCount[0].count || 0,
        pending_count: pendingCount[0].count || 0
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        transactions_count: 0,
        withdrawals_count: 0,
        pending_count: 0
      };
    }
  }
}

module.exports = Dashboard;