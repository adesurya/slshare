// models/Brand.js
const db = require('../config/database');

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
}

module.exports = { Product, Brand };