// Updated models/Product-brand-models.js to support dynamic product loading
const db = require('../config/database');

class Product {
  static async findAll(limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      // Konversi limit dan offset ke number untuk memastikan tipe data benar
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Validate sortField to prevent SQL injection
      const allowedSortFields = ['id', 'name', 'price', 'created_at', 'updated_at', 'cashback_percentage'];
      const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
      
      // Validate sortOrder to prevent SQL injection
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
      
      // Menggunakan query untuk parameter sortField dan sortOrder karena
      // prepared statements hanya untuk nilai bukan untuk identifier/nama kolom
      const [products] = await db.query(
        `SELECT * FROM products ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`,
        [numLimit, numOffset]
      );
      return products;
    } catch (error) {
      console.error('Error in Product.findAll:', error);
      throw error;
    }
  }

  // Add findById function from Product.js
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

  static async findByBrand(brand, limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      // Konversi limit dan offset ke number
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Validate sortField and sortOrder
      const allowedSortFields = ['id', 'name', 'price', 'created_at', 'updated_at', 'cashback_percentage'];
      const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
      
      const [products] = await db.query(
        `SELECT * FROM products WHERE brand = ? ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`,
        [brand, numLimit, numOffset]
      );
      return products;
    } catch (error) {
      console.error('Error in Product.findByBrand:', error);
      throw error;
    }
  }

  static async findByCategory(category, limit = 10, offset = 0, sortField = 'id', sortOrder = 'DESC') {
    try {
      // Convert to numbers 
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Validate sortField and sortOrder
      const allowedSortFields = ['id', 'name', 'price', 'created_at', 'updated_at', 'cashback_percentage'];
      const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
      
      const [rows] = await db.query(
        `SELECT * FROM products WHERE category = ? ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`,
        [category, numLimit, numOffset]
      );
      return rows;
    } catch (error) {
      console.error('Error finding products by category:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 20, offset = 0, sortField = 'id', sortOrder = 'ASC') {
    try {
      // Konversi limit dan offset ke number
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      // Validate sortField and sortOrder
      const allowedSortFields = ['id', 'name', 'price', 'created_at', 'updated_at', 'cashback_percentage'];
      const validSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
      
      const searchPattern = `%${searchTerm}%`;
      const [products] = await db.query(
        `SELECT * FROM products 
         WHERE name LIKE ? OR description LIKE ? OR brand LIKE ? OR category LIKE ?
         ORDER BY ${validSortField} ${validSortOrder} LIMIT ? OFFSET ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern, numLimit, numOffset]
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
      return Math.round((price * cashback_percentage) / 100);
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
      // Convert limit to number and use as parameter
      const numLimit = Number(limit);
      
      const [rows] = await db.query(
        `SELECT * FROM products WHERE category = ? AND id != ? ORDER BY id DESC LIMIT ?`,
        [category, productId, numLimit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting related products:', error);
      throw error;
    }
  }
  
  // New method to get all available categories
  static async getCategories() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category'
      );
      
      // Extract category names from result
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting product categories:', error);
      throw error;
    }
  }
  
  // New method to count products by category
  static async countByCategory(category) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM products WHERE category = ?',
        [category]
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error counting products by category:', error);
      throw error;
    }
  }
  
  // New method to get products with highest cashback percentage
  static async findHighestCashback(limit = 10) {
    try {
      const numLimit = Number(limit);
      
      const [rows] = await db.execute(
        'SELECT * FROM products ORDER BY cashback_percentage DESC LIMIT ?',
        [numLimit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error finding products with highest cashback:', error);
      throw error;
    }
  }
  
  // New method to find latest products
  static async findLatest(limit = 10) {
    try {
      const numLimit = Number(limit);
      
      // Try to order by created_at if available, otherwise fall back to id
      let query = 'SELECT * FROM products ORDER BY created_at DESC LIMIT ?';
      
      try {
        // Check if created_at column exists
        await db.execute('SELECT created_at FROM products LIMIT 1');
      } catch (columnError) {
        // If created_at doesn't exist, use id instead (assumes higher id = newer)
        query = 'SELECT * FROM products ORDER BY id DESC LIMIT ?';
      }
      
      const [rows] = await db.execute(query, [numLimit]);
      return rows;
    } catch (error) {
      console.error('Error finding latest products:', error);
      throw error;
    }
  }
  
  // Method to find products with price range
  static async findByPriceRange(minPrice, maxPrice, limit = 20, offset = 0) {
    try {
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      const numMinPrice = Number(minPrice) || 0;
      const numMaxPrice = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
      
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE price >= ? AND price <= ? ORDER BY price ASC LIMIT ? OFFSET ?',
        [numMinPrice, numMaxPrice, numLimit, numOffset]
      );
      
      return rows;
    } catch (error) {
      console.error('Error finding products by price range:', error);
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
      // Log untuk debugging
      console.log(`Finding brand with ID: ${id}`);
      
      const conn = await db.getConnection();
      
      // Query untuk tabel brands
      const query = 'SELECT * FROM brands WHERE id = ?';
      const [rows] = await conn.query(query, [id]);
      
      conn.release();
      
      if (rows.length === 0) {
        console.log(`No brand found with ID: ${id}`);
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error(`Error in Brand.findById: ${error.message}`);
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
      // Convert limit to number and use as parameter
      const numLimit = Number(limit);
      
      const [rows] = await db.query(
        `SELECT * FROM brands WHERE name LIKE ? ORDER BY cashback_percentage DESC LIMIT ?`,
        [`%${searchTerm}%`, numLimit]
      );
      return rows;
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }
  
  // New method to get brands with products count
  static async getBrandsWithProductCount() {
    try {
      const [rows] = await db.query(`
        SELECT b.*, COUNT(p.id) as product_count 
        FROM brands b
        LEFT JOIN products p ON p.brand = b.name
        GROUP BY b.id
        ORDER BY b.cashback_percentage DESC
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting brands with product count:', error);
      throw error;
    }
  }
}

module.exports = { Product, Brand };