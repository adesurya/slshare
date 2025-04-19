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
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding product by id:', error);
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