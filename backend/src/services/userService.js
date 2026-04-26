const pool = require('../config/database');

class UserService {
  async getUserById(userId) {
    try {
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, organization, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(email, passwordHash, firstName, lastName, organization) {
    try {
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, organization) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name',
        [email, passwordHash, firstName, lastName, organization]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
