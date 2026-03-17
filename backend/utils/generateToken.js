import jwt from 'jsonwebtoken';

/**
 * Generate JWT token with userId and role
 * @param {object} res - Express response (unused, for API consistency)
 * @param {string} userId - MongoDB user _id
 * @param {string} role - "admin" or "user" (stored in token for fast role checks)
 */
const generateToken = (res, userId, role) => {
  const payload = {
    userId,
    role: role || 'user',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Store JWT in an HttpOnly cookie for better security than localStorage.
  // Frontend should send requests with `credentials: "include"`.
  if (res) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Changed from 'lax' to 'none' for cross-origin
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  return token;
};

export default generateToken;
