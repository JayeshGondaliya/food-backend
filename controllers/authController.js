// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Generate JWT
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
// };

// // @desc    Register a new user
// // @route   POST /api/auth/register
// exports.registerUser = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const user = await User.create({ name, email, password });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       token: generateToken(user._id)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// exports.loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       token: generateToken(user._id)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Get user profile (protected)
// // @route   GET /api/auth/profile
// exports.getUserProfile = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (error) {
//     next(error);
//   }
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT with user id and role
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,                // include role in response
      token: generateToken(user)       // pass full user object
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,                // include role in response
      token: generateToken(user)       // pass full user object
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (protected)
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user contains id and role from the token (set by auth middleware)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);   // user object includes role from database
  } catch (error) {
    next(error);
  }
};
