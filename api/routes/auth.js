const express = require('express');
const passport = require('passport');
const isAuth = require('../middleware/isAuth');
const { register, login, me } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Start GitHub OAuth
router.get('/github', passport.authenticate('github', {
  scope: ['read:user', 'user:email', 'public_repo']
}));

// GitHub callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Get current logged-in user
router.get('/me', isAuth, me);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
