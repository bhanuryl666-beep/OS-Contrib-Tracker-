# Backend

This is the backend API for the OS Contribution Tracker application.

## Tech Stack
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Passport.js** for GitHub OAuth authentication
- **RESTful API** endpoints

## Project Structure
```
backend/
├── config/
│   └── passport.js          # GitHub OAuth configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── contributionController.js # Contribution management
├── middleware/
│   └── isAuth.js           # Authentication middleware
├── models/
│   ├── User.js             # User model
│   └── Contribution.js     # Contribution model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── github.js           # GitHub API routes
│   └── contributions.js    # Contribution routes
├── index.js                # Main server file
├── package.json            # Dependencies
├── .env.example           # Environment variables template
└── nodemon.json           # Development configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api` - API health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/github/repos` - Get user's GitHub repositories
- `GET /api/github/contributions` - Get contribution data
- `GET/POST/PUT/DELETE /api/contributions` - Manage tracked contributions

## Environment Variables

- `PORT` - Server port (default: 5050)
- `NODE_ENV` - Environment mode
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `CLIENT_URL` - Frontend URL for CORS