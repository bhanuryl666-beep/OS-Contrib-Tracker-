const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const requiredEnv = [
  'MONGO_URI',
  'JWT_SECRET',
  'SESSION_SECRET',
  'CLIENT_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));
app.use('/api/contributions', require('./routes/contributions'));

app.get('/', (req, res) => {
  res.json({ message: 'OS Contrib Tracker API running!' });
});

// Catch all handler: serve React app for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// For Vercel deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB error:', err);
      process.exit(1);
    });
}
