const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => jwt.sign(
  { id: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  profileUrl: user.profileUrl
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      displayName: username
    });

    res.status(201).json({
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to login user' });
  }
};

exports.me = (req, res) => {
  res.json(publicUser(req.user));
};
