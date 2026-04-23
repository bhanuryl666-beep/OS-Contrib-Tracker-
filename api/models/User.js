const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: String,
  displayName: String,
  avatar: String,
  profileUrl: String,
  accessToken: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
