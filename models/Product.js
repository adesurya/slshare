// models/Product.js
const db = require('../config/database');

class Product {
  static async findAll(limit = 10, offset = 0) {
    try {
      // Convert to numbers and use directly in the query
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [rows] = await db.query(
        `SELECT * FROM products ORDER BY id DESC LIMIT ${numLimit} OFFSET ${numOffset}`
      );
      return rows;
    } catch (error) {
      console.error('Error finding all products:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      // Log untuk debugging
      console.log(`Finding product with ID: ${id}`);
      
      const conn = await db.getConnection();
      
      // Hapus kondisi is_active karena kolom ini tidak ada di tabel
      const query = 'SELECT * FROM products WHERE id = ?';
      const [rows] = await conn.query(query, [id]);
      
      conn.release();
      
      if (rows.length === 0) {
        console.log(`No product found with ID: ${id}`);
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error(`Error in Product.findById: ${error.message}`);
      throw error;
    }
  }

  static async findByBrand(brandName, limit = 10, offset = 0) {
    try {
      // Convert to numbers and use directly in the query
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [rows] = await db.query(
        `SELECT * FROM products WHERE brand = ? ORDER BY id DESC LIMIT ${numLimit} OFFSET ${numOffset}`,
        [brandName]
      );
      return rows;
    } catch (error) {
      console.error('Error finding products by brand:', error);
      throw error;
    }
  }

  static async findByCategory(category, limit = 10, offset = 0) {
    try {
      // Convert to numbers and use directly in the query
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [rows] = await db.query(
        `SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT ${numLimit} OFFSET ${numOffset}`,
        [category]
      );
      return rows;
    } catch (error) {
      console.error('Error finding products by category:', error);
      throw error;
    }
  }

  static async calculateCashback(productId) {
    try {
      const [rows] = await db.execute(
        'SELECT price, cashback_percentage FROM products WHERE id = ?',
        [productId]
      );
      
      if (!rows.length) return 0;
      
      const { price, cashback_percentage } = rows[0];
      return (price * cashback_percentage / 100).toFixed(0);
    } catch (error) {
      console.error('Error calculating cashback:', error);
      throw error;
    }
  }
}

module.exports = Product;