import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Read JWT from either:
 * - Authorization: Bearer <token>
 * - Cookie: jwt=<token> (HttpOnly)
 *
 * JWT payload: { userId, role }
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1) Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2) Cookie fallback
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch user from DB (admin must be stored in DB too).
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized. User not found.' });
    }

    // Attach user to request for downstream middleware/routes.
    req.user = user;
    req.userRole = decoded.role || user.role || 'user';

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
  }
};

/**
 * Allow only normal users (role === "user")
 */
const verifyUser = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'user') return next();
  return res.status(403).json({ message: 'Access denied. User privileges required.' });
};

/**
 * Allow only admins (role === "admin")
 * Blocks normal users from admin-only routes.
 */
const verifyAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

export { verifyToken, verifyUser, verifyAdmin };
