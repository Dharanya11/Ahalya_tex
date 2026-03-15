import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { ADMIN_EMAIL } from '../config/admin.js';

/**
 * Basic email format validation
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @desc    Login - User OR Admin (from MongoDB)
 * @route   POST /api/auth/login
 * @access  Public
 *
 * Request body:
 * - email
 * - password
 *
 * Login rules:
 * 1) If email === admin@example.com -> login as ADMIN
 * 2) Else -> login as USER
 */
const login = async (req, res) => {
  let { email, password } = req.body;
  email = email?.trim()?.toLowerCase();
  password = password?.trim();

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check MongoDB users (admins are stored here too)
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked && user.role !== 'admin') {
      return res.status(403).json({ message: 'Your account has been blocked by admin.' });
    }

    // Verify password (bcrypt)
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Enforce your single-login rules by email
    const isAdminLogin = email === ADMIN_EMAIL;
    if (isAdminLogin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin account is not configured correctly.' });
    }
    if (!isAdminLogin && user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const token = generateToken(res, user._id, user.role);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
      isBlocked: user.isBlocked,
      token, // kept for compatibility; prefer cookie-based auth
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Register - Normal user only
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const normalizedEmail = email?.trim()?.toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL) {
      return res.status(400).json({ message: 'This email is reserved for admin.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user - password is hashed by User model pre-save hook (bcrypt)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      // role/isAdmin are enforced by the User model single-admin rule
    });

    if (user) {
      const token = generateToken(res, user._id, user.role);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Logout (clears HttpOnly cookie)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: 'Logged out' });
};

// Legacy: kept for backward compatibility with /api/users/login
const authUser = login;

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;
  if (typeof req.body.isAdmin === 'boolean') {
    user.isAdmin = req.body.isAdmin;
  }
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, isAdmin: updated.isAdmin, isBlocked: updated.isBlocked });
};

// @desc    Block/unblock a user
// @route   PUT /api/users/:id/block
// @access  Admin
const toggleUserBlock = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.role === 'admin' || user.isAdmin) {
    res.status(400).json({ message: 'Admin account cannot be blocked.' });
    return;
  }

  const nextBlocked = typeof req.body?.isBlocked === 'boolean' ? req.body.isBlocked : !user.isBlocked;
  user.isBlocked = nextBlocked;
  const updated = await user.save();

  res.json({ _id: updated._id, isBlocked: updated.isBlocked });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  await user.remove();
  res.json({ message: 'User removed' });
};

// registerUser = signup (for userRoutes backward compatibility)
const registerUser = register;

// Backward compatibility: /api/auth/signup -> /api/auth/register
const signup = register;

export { login, register, signup, logout, authUser, registerUser, getUsers, getUserById, updateUser, deleteUser, toggleUserBlock };
