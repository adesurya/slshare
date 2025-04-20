// models/Product-brand-models.js
const db = require('../config/database');

class Product {
  static async findAll(limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      const [products] = await db.execute(
        `SELECT * FROM products ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return products;
    } catch (error) {
      console.error('Error in Product.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error in Product.findById:', error);
      throw error;
    }
  }

  static async findByBrand(brand, limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      const [products] = await db.execute(
        `SELECT * FROM products WHERE brand = ? ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
        [brand, limit, offset]
      );
      return products;
    } catch (error) {
      console.error('Error in Product.findByBrand:', error);
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

  static async search(searchTerm, limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      const searchPattern = `%${searchTerm}%`;
      const [products] = await db.execute(
        `SELECT * FROM products 
         WHERE name LIKE ? OR description LIKE ? OR brand LIKE ? OR category LIKE ?
         ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]
      );
      return products;
    } catch (error) {
      console.error('Error in Product.search:', error);
      throw error;
    }
  }

  static async calculateCashback(productId) {
    try {
      const [products] = await db.execute(
        'SELECT price, cashback_percentage FROM products WHERE id = ?',
        [productId]
      );
      
      if (products.length === 0) {
        return 0;
      }
      
      const { price, cashback_percentage } = products[0];
      return (price * cashback_percentage) / 100;
    } catch (error) {
      console.error('Error in Product.calculateCashback:', error);
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
      // Convert limit to number and use directly in the query
      const numLimit = Number(limit);
      
      const [rows] = await db.query(
        `SELECT * FROM products WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ${numLimit}`,
        [category, productId]
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
      // Convert limit to number and use directly in the query
      const numLimit = Number(limit);
      
      const [rows] = await db.query(
        `SELECT * FROM brands WHERE name LIKE ? ORDER BY cashback_percentage DESC LIMIT ${numLimit}`,
        [`%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }
}

module.exports = { Product, Brand };