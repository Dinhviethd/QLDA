const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    SECRET_KEY + '_refresh',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

exports.verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY + '_refresh');
    return decoded;
  } catch (error) {
    return null;
  }
};

exports.generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
};
