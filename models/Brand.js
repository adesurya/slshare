// models/Brand.js
const db = require('../config/database');

class Brand {
  static async findAll() {
    try {
      // Simply get all brands - the products_count field is now maintained in the database
      const [rows] = await db.execute(
        'SELECT * FROM brands ORDER BY priority ASC, cashback_percentage DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all brands:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      // Simply get the brand by ID - products_count is already in the database
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
      // Get the brand by name - products_count is already in the database
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
  
  // Update brand priority
  static async updatePriority(id, priority) {
    try {
      const [result] = await db.execute(
        'UPDATE brands SET priority = ? WHERE id = ?',
        [priority, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating brand priority:', error);
      throw error;
    }
  }
  
  // Method to manually resynchronize product counts if needed
  static async syncProductCounts() {
    try {
      const [result] = await db.execute('CALL sync_product_counts()');
      return result;
    } catch (error) {
      console.error('Error synchronizing product counts:', error);
      throw error;
    }
  }
}

module.exports = Brand;