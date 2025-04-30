// database.js
// Fixed database configuration to properly connect with MySQL

// Import required modules
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Create a MySQL connection pool with proper configuration
 * This replaces the empty database.js file that was causing issues
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sijagolinkshare_app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Properly format DATETIME for MySQL queries
  timezone: '+00:00',
  // Debug flag - set to true when troubleshooting connection issues
  debug: false
});

/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
};

// Export the pool for use in other modules
module.exports = pool;

// Also export the test function for startup checks
module.exports.testConnection = testConnection;