// User model for database operations
const db = require('./db');

class User {
  constructor() {
    this.cursor = db.getCursor();
  }

  // Get user by username (for authentication)
  async getUserByUsername(username) {
    try {
      const [rows] = await this.cursor.execute(
        'SELECT * FROM users WHERE firstname = ? OR lastname = ? OR email = ?',
        [username, username, username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const [rows] = await this.cursor.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Update user cash balance
  async updateUserCash(userId, newCashAmount) {
    try {
      const [result] = await this.cursor.execute(
        'UPDATE users SET cash = ? WHERE id = ?',
        [newCashAmount, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user cash:', error);
      throw error;
    }
  }

  // Get user's current cash balance
  async getUserCash(userId) {
    try {
      const [rows] = await this.cursor.execute(
        'SELECT cash FROM users WHERE id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0].cash : null;
    } catch (error) {
      console.error('Error getting user cash:', error);
      throw error;
    }
  }

  // Authenticate user (simple version - in production, use proper password hashing)
  async authenticateUser(username, password) {
    try {
      // In a real application, you would check password hash
      // For now, we'll just check if user exists
      const user = await this.getUserByUsername(username);
      if (user) {
        return {
          id: user.id,
          username: username,
          firstname: user.firstname,
          lastname: user.lastname,
          cash: user.cash,
          email: user.email,
          phone_number: user.phone_number
        };
      }
      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = new User();
