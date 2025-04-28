// models/Order.js
const db = require('../config/database');

class Order {
  static async findAll(limit = 20, offset = 0) {
    try {
      // Convert to numbers to avoid SQL errors
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [orders] = await db.query(
        `SELECT o.*, u.username 
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [numLimit, numOffset]
      );
      return orders;
    } catch (error) {
      console.error('Error in Order.findAll:', error);
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const [orders] = await db.execute(
        `SELECT o.*, u.username, u.email, u.full_name
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [id]
      );
      
      if (orders.length === 0) {
        return null;
      }
      
      // Get order items
      const [items] = await db.execute(
        `SELECT oi.*, p.name as product_name, p.image as product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id]
      );
      
      // Attach items to order
      const order = orders[0];
      order.items = items;
      
      return order;
    } catch (error) {
      console.error('Error in Order.findById:', error);
      throw error;
    }
  }
  
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      // Convert to numbers to avoid SQL errors
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [orders] = await db.query(
        `SELECT * FROM orders 
         WHERE user_id = ? 
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, numLimit, numOffset]
      );
      return orders;
    } catch (error) {
      console.error('Error in Order.findByUserId:', error);
      throw error;
    }
  }
  
  static async findByStatus(status, limit = 20, offset = 0) {
    try {
      // Convert to numbers to avoid SQL errors
      const numLimit = Number(limit);
      const numOffset = Number(offset);
      
      const [orders] = await db.query(
        `SELECT o.*, u.username 
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.status = ?
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [status, numLimit, numOffset]
      );
      return orders;
    } catch (error) {
      console.error('Error in Order.findByStatus:', error);
      throw error;
    }
  }
  
  static async createOrder(orderData, items) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (order_number, user_id, total_amount, status, notes) VALUES (?, ?, ?, ?, ?)',
        [
          orderData.order_number,
          orderData.user_id,
          orderData.total_amount,
          orderData.status || 'pending',
          orderData.notes || null
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.price * item.quantity
          ]
        );
      }
      
      // Add initial status to history
      await connection.execute(
        'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
        [
          orderId,
          orderData.status || 'pending',
          'Order created',
          orderData.created_by || null
        ]
      );
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      console.error('Error in Order.createOrder:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async updateStatus(orderId, status, notes = null, updatedBy = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update order status
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
      
      // Add status to history
      await connection.execute(
        'INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)',
        [orderId, status, notes, updatedBy]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error in Order.updateStatus:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async getStatusHistory(orderId) {
    try {
      const [history] = await db.execute(
        `SELECT h.*, a.username as admin_username
         FROM order_status_history h
         LEFT JOIN admin_users a ON h.updated_by = a.id
         WHERE h.order_id = ?
         ORDER BY h.created_at DESC`,
        [orderId]
      );
      return history;
    } catch (error) {
      console.error('Error in Order.getStatusHistory:', error);
      throw error;
    }
  }
  
  static async getStats() {
    try {
      const [stats] = await db.execute(`
        SELECT
          COUNT(*) as total,
          SUM(total_amount) as total_sales,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM orders
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Error in Order.getStats:', error);
      throw error;
    }
  }
}

module.exports = { Order };