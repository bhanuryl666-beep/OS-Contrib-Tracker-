# OS Contrib Tracker

The Open Source Contribution Tracker is a web-based MERN stack platform that helps developers monitor and analyze their open-source contributions across GitHub repositories.

Users can register and login with JWT authentication, then create, read, update, and delete manually tracked contributions. They can also connect GitHub with OAuth to fetch repositories, commits, pull requests, and contribution statistics.

## Tech Stack

- MongoDB with Mongoose
- Express and Node.js API
- React client built with Vite
- JWT authentication with bcrypt password hashing
- GitHub OAuth with Passport
- React Router DOM for Login, Register, and Dashboard pages

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

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Create a GitHub OAuth app and set the callback URL to:

```text
http://localhost:5050/api/auth/github/callback
```

Required environment variables are listed in [server/.env.example](server/.env.example).

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
