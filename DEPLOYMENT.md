# 🚀 Open Source Contribution Tracker - Deployment Guide

## Prerequisites

1. **MongoDB Database** - Set up a MongoDB Atlas cluster or use a cloud database
2. **GitHub OAuth App** - Create OAuth app in GitHub settings
3. **Deployment Platform** - Choose one of the options below

## 📋 Pre-Deployment Setup

### 1. GitHub OAuth Setup
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Application name**: OS Contribution Tracker
   - **Homepage URL**: `https://your-frontend-domain.com`
   - **Authorization callback URL**: `https://your-backend-domain.com/api/auth/github/callback`
3. Copy the Client ID and Client Secret

### 2. MongoDB Setup
1. Create a [MongoDB Atlas](https://cloud.mongodb.com/) account
2. Create a new cluster and database
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/os-contrib-tracker`

### 3. Environment Variables
Copy `.env.production` to your deployment platform and fill in:
```env
CLIENT_URL=https://your-frontend-domain.com
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/os-contrib-tracker
SESSION_SECRET=your-long-random-session-secret-here
JWT_SECRET=your-different-long-jwt-secret-here
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_CALLBACK_URL=https://your-backend-domain.com/api/auth/github/callback
```

## 🌐 Deployment Options

### Option 1: Render.com (Recommended - Free tier available)

1. **Connect Repository**:
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" > "Blueprint"
   - Connect your GitHub repository

2. **Deploy Services**:
   - The `render.yaml` file will automatically create two services
   - Set environment variables in Render dashboard
   - Deploy both frontend and backend

3. **Update GitHub OAuth**:
   - Update callback URL with your Render backend URL

### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel)**:
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your repository
3. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
4. Deploy

**Backend (Railway)**:
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project from GitHub repo
3. Set all environment variables
4. Deploy

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   heroku create your-app-backend
   heroku config:set NODE_ENV=production
   # Set all environment variables
   git push heroku main
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend
   heroku create your-app-frontend --buildpack mars/create-react-app
   heroku config:set VITE_API_URL=https://your-backend.herokuapp.com
   git push heroku main
   ```

## 🔧 Post-Deployment Configuration

1. **Update GitHub OAuth App**:
   - Change callback URL to production backend URL

2. **Test the Application**:
   - Visit your frontend URL
   - Try registering/logging in
   - Connect GitHub account
   - Check dashboard functionality

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Check CLIENT_URL environment variable
2. **GitHub OAuth Issues**: Verify callback URL matches exactly
3. **Database Connection**: Ensure MongoDB connection string is correct
4. **Environment Variables**: Make sure all required variables are set

### Logs:
- **Render**: Check service logs in dashboard
- **Vercel**: Check function logs
- **Railway**: Check deployment logs
- **Heroku**: Use `heroku logs --tail -a your-app-name`

## 📞 Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Verify all environment variables are set correctly
3. Ensure GitHub OAuth app is configured properly
4. Check MongoDB connection and permissions

## 🎯 Production URLs

After deployment, update these URLs in your GitHub OAuth app:
- **Homepage URL**: `https://your-frontend-domain.com`
- **Callback URL**: `https://your-backend-domain.com/api/auth/github/callback`