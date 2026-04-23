const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Please login first' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        return next();
      })
      .catch(() => res.status(401).json({ message: 'Invalid token' }));
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = isAuth;
