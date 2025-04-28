const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  static async findByVerificationToken(token) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()',
        [token]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (24 hours from now)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      
      // Insert user into database
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, full_name, is_verified, verification_token, verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userData.username, 
          userData.email, 
          hashedPassword, 
          userData.full_name || null, 
          false, 
          verificationToken, 
          expirationDate
        ]
      );
      
      return {
        id: result.insertId,
        verificationToken
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async verifyEmail(token) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_verified = true, verification_token = NULL, verification_expires = NULL WHERE verification_token = ? AND verification_expires > NOW()',
        [token]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  static async regenerateVerificationToken(userId) {
    try {
      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (24 hours from now)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      
      // Update user with new token
      const [result] = await db.execute(
        'UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?',
        [verificationToken, expirationDate, userId]
      );
      
      return result.affectedRows > 0 ? verificationToken : null;
    } catch (error) {
      console.error('Error regenerating verification token:', error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(userId, userData) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET full_name = ?, profile_image = ? WHERE id = ?',
        [userData.full_name, userData.profile_image, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async changePassword(userId, newPassword) {
    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  static async createPasswordResetToken(email) {
    try {
      // Check if user exists
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (1 hour from now)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);
      
      // Delete any existing token for this email
      await db.execute(
        'DELETE FROM password_resets WHERE email = ?',
        [email]
      );
      
      // Insert new reset token
      await db.execute(
        'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, resetToken, expirationDate]
      );
      
      return resetToken;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  }

  static async verifyPasswordResetToken(token, email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM password_resets WHERE token = ? AND email = ? AND expires_at > NOW()',
        [token, email]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      throw error;
    }
  }

  static async resetPassword(token, email, newPassword) {
    try {
      // Verify token
      const isValid = await this.verifyPasswordResetToken(token, email);
      
      if (!isValid) {
        return false;
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      
      // Delete used token
      await db.execute(
        'DELETE FROM password_resets WHERE token = ?',
        [token]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static async createSession(userId, sessionToken, deviceInfo, expiresAt) {
    try {
      const [result] = await db.execute(
        'INSERT INTO user_sessions (user_id, session_token, device_info, expires_at) VALUES (?, ?, ?, ?)',
        [userId, sessionToken, deviceInfo, expiresAt]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async validateSession(sessionToken) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
        [sessionToken]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  }

  static async deleteSession(sessionToken) {
    try {
      const [result] = await db.execute(
        'DELETE FROM user_sessions WHERE session_token = ?',
        [sessionToken]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  static async addToWishlist(userId, productId) {
    try {
      // Check if already in wishlist
      const [existingRows] = await db.execute(
        'SELECT * FROM user_wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (existingRows.length > 0) {
        return existingRows[0].id;
      }
      
      // Add to wishlist
      const [result] = await db.execute(
        'INSERT INTO user_wishlists (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }
  
  static async removeFromWishlist(userId, productId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM user_wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }
  
  static async getWishlist(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT p.* FROM products p ' +
        'JOIN user_wishlists w ON p.id = w.product_id ' +
        'WHERE w.user_id = ? ' +
        'ORDER BY w.created_at DESC',
        [userId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  }
  
  static async isInWishlist(userId, productId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM user_wishlists WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      throw error;
    }
  }

  static async getNotifications(userId, limit = 10, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    try {
      const [result] = await db.execute(
        'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async getUnreadNotificationsCount(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
        [userId]
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      throw error;
    }
  }

  static async saveSearchTerm(userId, searchTerm) {
    try {
      const [result] = await db.execute(
        'INSERT INTO search_history (user_id, search_term) VALUES (?, ?)',
        [userId, searchTerm]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error saving search term:', error);
      throw error;
    }
  }

  static async getSearchHistory(userId, limit = 10) {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT search_term FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      
      return rows.map(row => row.search_term);
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  static async clearSearchHistory(userId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM search_history WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  static async createAffiliateLink(userId, productId) {
    try {
      // Check if user already has an affiliate link for this product
      const [existingRows] = await db.execute(
        'SELECT * FROM affiliate_links WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (existingRows.length > 0) {
        return existingRows[0].link_code;
      }
      
      // Generate unique link code
      const linkCode = crypto.randomBytes(8).toString('hex');
      
      // Create affiliate link
      await db.execute(
        'INSERT INTO affiliate_links (user_id, product_id, link_code) VALUES (?, ?, ?)',
        [userId, productId, linkCode]
      );
      
      return linkCode;
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      throw error;
    }
  }

  static async recordLinkClick(linkCode, ipAddress, userAgent, referrer) {
    try {
      // Get affiliate link ID
      const [linkRows] = await db.execute(
        'SELECT id FROM affiliate_links WHERE link_code = ?',
        [linkCode]
      );
      
      if (!linkRows.length) {
        return false;
      }
      
      const affiliateLinkId = linkRows[0].id;
      
      // Record click
      await db.execute(
        'INSERT INTO link_clicks (affiliate_link_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)',
        [affiliateLinkId, ipAddress, userAgent, referrer]
      );
      
      // Update click count
      await db.execute(
        'UPDATE affiliate_links SET clicks = clicks + 1, updated_at = NOW() WHERE id = ?',
        [affiliateLinkId]
      );
      
      return true;
    } catch (error) {
      console.error('Error recording link click:', error);
      throw error;
    }
  }

  static async registerDeviceToken(userId, deviceToken, deviceType) {
    try {
      // Check if token already exists
      const [existingRows] = await db.execute(
        'SELECT * FROM user_device_tokens WHERE user_id = ? AND device_token = ?',
        [userId, deviceToken]
      );
      
      if (existingRows.length > 0) {
        return existingRows[0].id;
      }
      
      // Register new token
      const [result] = await db.execute(
        'INSERT INTO user_device_tokens (user_id, device_token, device_type) VALUES (?, ?, ?)',
        [userId, deviceToken, deviceType]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  static async removeDeviceToken(userId, deviceToken) {
    try {
      const [result] = await db.execute(
        'DELETE FROM user_device_tokens WHERE user_id = ? AND device_token = ?',
        [userId, deviceToken]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing device token:', error);
      throw error;
    }
  }

// Log user activity
static async logActivity(userId, type, description, ipAddress = null, deviceInfo = null) {
  try {
    const [result] = await db.execute(
      'INSERT INTO user_activities (user_id, type, description, ip_address, device_info) VALUES (?, ?, ?, ?, ?)',
      [userId, type, description, ipAddress, deviceInfo]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw the error - activity logging should not break main functionality
    return null;
  }
}

static async getUserActivities(userId, limit = 10, offset = 0) {
  try {
    const [activities] = await db.query(
      'SELECT * FROM user_activities WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [userId, Number(limit), Number(offset)]
    );
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    return []; // Return empty array on error
  }
}

// Get user order statistics - improved version
static async getUserStats(userId) {
  try {
    // Get total orders
    const [ordersResult] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [userId]
    );
    const totalOrders = ordersResult[0].count;
    
    // Get total spent
    const [spentResult] = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status != "cancelled"',
      [userId]
    );
    const totalSpent = spentResult[0].total || 0; // Ensure we have a number, not NULL
    
    // Get total cashback
    const [cashbackResult] = await db.query(
      'SELECT COALESCE(SUM(cashback_amount), 0) as total FROM orders WHERE user_id = ? AND status = "completed"',
      [userId]
    );
    const totalCashback = cashbackResult[0].total || 0; // Ensure we have a number, not NULL
    
    // Get last order with details
    const [lastOrderResult] = await db.query(
      `SELECT o.*, COUNT(oi.id) as items_count 
       FROM orders o 
       LEFT JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.user_id = ? 
       GROUP BY o.id
       ORDER BY o.created_at DESC 
       LIMIT 1`,
      [userId]
    );
    
    const lastOrder = lastOrderResult.length > 0 ? lastOrderResult[0] : null;
    
    // Get wallet balance if available
    let walletBalance = 0;
    try {
      const [walletResult] = await db.query(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [userId]
      );
      if (walletResult.length > 0) {
        walletBalance = walletResult[0].wallet_balance || 0;
      }
    } catch (walletError) {
      console.error('Error getting wallet balance:', walletError);
    }
    
    return {
      totalOrders,
      totalSpent,
      cashbackEarned: totalCashback,
      walletBalance,
      lastOrder
    };
  } catch (error) {
    console.error('Error in User.getUserStats:', error);
    // Return default values if error
    return {
      totalOrders: 0,
      totalSpent: 0,
      cashbackEarned: 0,
      walletBalance: 0,
      lastOrder: null
    };
  }
}

// Get user recent orders with pagination
static async getUserOrders(userId, limit = 5, offset = 0) {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, Number(limit), Number(offset)]
    );
    return orders;
  } catch (error) {
    console.error('Error in User.getUserOrders:', error);
    return []; // Return empty array on error
  }
}

}

module.exports = User;