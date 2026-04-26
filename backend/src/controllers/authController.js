const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const userService = require('../services/userService');
const passwordResetService = require('../services/passwordResetService');

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, organization } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userService.createUser(
      email,
      passwordHash,
      firstName,
      lastName,
      organization
    );

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

exports.check = async (req, res) => {
  try {
    res.json({ authenticated: true, userId: req.userId });
  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists
      return res.json({
        message: 'If email exists, password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = passwordResetService.generatePasswordResetToken(email);

    // In production, send email with reset link
    // Example: await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
      message: 'Password reset link sent to email',
      // Only for development - remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Forgot password failed' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Reset password
    const user = await passwordResetService.resetPassword(token, newPassword);

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: error.message || 'Password reset failed' });
  }
};
