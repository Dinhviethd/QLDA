const crypto = require('crypto');
const { hashPassword } = require('../utils/password');
const userService = require('./userService');

// Store reset tokens in memory (in production, use database)
const resetTokens = new Map();

exports.generatePasswordResetToken = (email) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3600000; // 1 hour
  
  resetTokens.set(token, {
    email,
    expiresAt
  });
  
  return token;
};

exports.verifyPasswordResetToken = (token) => {
  const data = resetTokens.get(token);
  
  if (!data) {
    return null;
  }
  
  if (Date.now() > data.expiresAt) {
    resetTokens.delete(token);
    return null;
  }
  
  return data;
};

exports.resetPassword = async (token, newPassword) => {
  const data = exports.verifyPasswordResetToken(token);
  
  if (!data) {
    throw new Error('Invalid or expired reset token');
  }
  
  const passwordHash = await hashPassword(newPassword);
  const user = await userService.getUserByEmail(data.email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user password in database
  // This assumes you have an updateUserPassword method in userService
  await userService.updateUserPassword(user.id, passwordHash);
  
  resetTokens.delete(token);
  
  return user;
};

exports.clearExpiredTokens = () => {
  for (const [token, data] of resetTokens) {
    if (Date.now() > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
};
