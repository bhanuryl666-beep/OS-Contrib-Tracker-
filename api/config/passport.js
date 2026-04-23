const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user', 'repo', 'read:org']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        // Update token if user exists
        user.accessToken = accessToken;
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatar: profile.photos[0]?.value,
        profileUrl: profile.profileUrl,
        accessToken: accessToken
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};