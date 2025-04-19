// models/Product.js
const db = require('../config/database');

class Product {
  static async findAll(limit = 10, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?',
        [limit, offset]
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
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE brand = ? ORDER BY id DESC LIMIT ? OFFSET ?',
        [brandName, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error finding products by brand:', error);
      throw error;
    }
  }

  static async findByCategory(category, limit = 10, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT ? OFFSET ?',
        [category, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error finding products by category:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 20, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE ' +
        'name LIKE ? OR ' +
        'description LIKE ? OR ' +
        'brand LIKE ? OR ' +
        'category LIKE ? ' +
        'ORDER BY id DESC LIMIT ? OFFSET ?',
        [
          `%${searchTerm}%`, 
          `%${searchTerm}%`, 
          `%${searchTerm}%`, 
          `%${searchTerm}%`,
          limit,
          offset
        ]
      );
      return rows;
    } catch (error) {
      console.error('Error searching products:', error);
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
      return Math.round(price * cashback_percentage / 100);
    } catch (error) {
      console.error('Error calculating cashback:', error);
      throw error;
    }
  }
  
  static async getRelatedProducts(productId, limit = 4) {
    try {
      // First get the category of the current product
      const [product] = await db.execute(
        'SELECT category FROM products WHERE id = ?',
        [productId]
      );
      
      if (!product.length) return [];
      
      const category = product[0].category;
      
      // Get other products in the same category
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ?',
        [category, productId, limit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting related products:', error);
      throw error;
    }
  }
}

class Brand {
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM brands ORDER BY cashback_percentage DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all brands:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM brands WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding brand by id:', error);
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM brands WHERE name = ?',
        [name]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding brand by name:', error);
      throw error;
    }
  }
  
  static async search(searchTerm, limit = 10) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM brands WHERE name LIKE ? ORDER BY cashback_percentage DESC LIMIT ?',
        [`%${searchTerm}%`, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }
}

module.exports = { Product, Brand };