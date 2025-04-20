// models/Admin.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class Admin {
  static async findByUsername(username) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding admin by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admin_users WHERE email = ?',
        [email]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admin_users WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding admin by id:', error);
      throw error;
    }
  }

  static async create(adminData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Insert admin into database
      const [result] = await db.execute(
        'INSERT INTO admin_users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [
          adminData.username, 
          adminData.email, 
          hashedPassword, 
          adminData.full_name || null, 
          adminData.role || 'admin'
        ]
      );
      
      return {
        id: result.insertId
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(adminId, adminData) {
    try {
      const [result] = await db.execute(
        'UPDATE admin_users SET full_name = ?, email = ? WHERE id = ?',
        [adminData.full_name, adminData.email, adminId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }

  static async changePassword(adminId, newPassword) {
    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [result] = await db.execute(
        'UPDATE admin_users SET password = ? WHERE id = ?',
        [hashedPassword, adminId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error changing admin password:', error);
      throw error;
    }
  }

  static async createSession(adminId, sessionToken, deviceInfo, expiresAt) {
    try {
      const [result] = await db.execute(
        'INSERT INTO admin_sessions (admin_id, session_token, device_info, expires_at) VALUES (?, ?, ?, ?)',
        [adminId, sessionToken, deviceInfo, expiresAt]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating admin session:', error);
      throw error;
    }
  }

  static async validateSession(sessionToken) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
        [sessionToken]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error validating admin session:', error);
      throw error;
    }
  }

  static async deleteSession(sessionToken) {
    try {
      const [result] = await db.execute(
        'DELETE FROM admin_sessions WHERE session_token = ?',
        [sessionToken]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting admin session:', error);
      throw error;
    }
  }

  // Get all admins
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT id, username, email, full_name, role, created_at FROM admin_users ORDER BY id DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error finding all admins:', error);
      throw error;
    }
  }

  // Update admin role
  static async updateRole(adminId, role) {
    try {
      const [result] = await db.execute(
        'UPDATE admin_users SET role = ? WHERE id = ?',
        [role, adminId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating admin role:', error);
      throw error;
    }
  }

  // Delete admin
  static async delete(adminId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM admin_users WHERE id = ?',
        [adminId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }

  // Check if an admin is a superadmin
  static async isSuperAdmin(adminId) {
    try {
      const [rows] = await db.execute(
        'SELECT role FROM admin_users WHERE id = ?',
        [adminId]
      );
      
      return rows.length > 0 && rows[0].role === 'superadmin';
    } catch (error) {
      console.error('Error checking superadmin status:', error);
      throw error;
    }
  }

  // Get activity logs
  static async getActivityLogs(limit = 100) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting admin activity logs:', error);
      throw error;
    }
  }

  // Log admin activity
  static async logActivity(adminId, action, details) {
    try {
      const [result] = await db.execute(
        'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [adminId, action, JSON.stringify(details)]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error logging admin activity:', error);
      throw error;
    }
  }
}

module.exports = Admin;