# OS Contrib Tracker

The Open Source Contribution Tracker is a web-based MERN stack platform that helps developers monitor and analyze their open-source contributions across GitHub repositories.

Users can register and login with JWT authentication, then create, read, update, and delete manually tracked contributions. They can also connect GitHub with OAuth to fetch repositories, commits, pull requests, and contribution statistics.

## Project Structure

```
os-contrib-tracker/
├── backend/                 # Express.js API server
│   ├── config/             # Passport OAuth config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── frontend/                # React client application
│   ├── public/             # Static assets & favicons
│   ├── src/                # React components & logic
│   └── index.html          # HTML template
├── scripts/                 # Development scripts
└── package.json            # Root package configuration
```

## Tech Stack

- **Backend**: MongoDB with Mongoose, Express and Node.js API
- **Frontend**: React client built with Vite
- **Authentication**: JWT with bcrypt, GitHub OAuth with Passport
- **Routing**: React Router DOM
- **Icons**: Lucide React, custom favicon system

## Features

- GitHub authentication and session-based login
- JWT registration and login
- Password hashing with bcrypt
- Repository overview with stars and direct GitHub links
- Pull request history authored by the connected user
- Repository-specific commit explorer
- GitHub-style contribution graph built from recent commits
- Current contribution streak metric
- Full CRUD for manually tracked contributions
- Dashboard actions for analyzing activity and tracking contributions
- Summary dashboard for contribution activity

## Setup

Install dependencies for both apps:

```bash
npm run install:all
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Create a GitHub OAuth app and set the callback URL to:

```text
http://localhost:5050/api/auth/github/callback
```

Required environment variables are listed in [backend/.env.example](backend/.env.example).

## Useful Commands

```bash
npm run dev
npm run server
npm run client
npm test
```

The React client runs on `http://localhost:3000` and proxies API requests to the Express server on `http://localhost:5050`.

You can also run the server only:

```bash
cd server
npm test
npm start
```

## API Routes

- `GET /health` checks that the API is running.
- `GET /api/auth/github` starts GitHub OAuth login.
- `POST /api/auth/register` creates a user with a hashed password and returns a JWT.
- `POST /api/auth/login` verifies credentials and returns a JWT.
- `GET /api/auth/me` returns the logged-in user.
- `GET /api/auth/logout` logs out the current user.
- `GET /api/contributions` reads tracked contributions.
- `POST /api/contributions` creates a tracked contribution.
- `PUT /api/contributions/:id` updates a tracked contribution.
- `DELETE /api/contributions/:id` deletes a tracked contribution.
- `GET /api/github/repos` returns the user's repositories.
- `GET /api/github/commits/:owner/:repo` returns user commits for a repository.
- `GET /api/github/contributions` returns daily commit counts for the contribution graph.
- `GET /api/github/prs` returns pull requests authored by the user.
- `GET /api/github/stats` returns summary contribution stats.
