# Frontend

This is the frontend React application for the OS Contribution Tracker.

## Tech Stack
- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure
```
frontend/
├── public/
│   ├── favicon.svg         # Modern SVG favicon
│   ├── favicon.png         # PNG favicon (replace placeholder)
│   ├── favicon.ico         # ICO favicon (replace placeholder)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── api.js              # API client configuration
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── styles.css          # Global styles
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Features

- **GitHub OAuth Authentication** - Login with GitHub
- **Repository Tracking** - View and track GitHub repositories
- **Contribution Analytics** - Visualize contribution data
- **Responsive Design** - Mobile-friendly interface
- **PWA Support** - Installable web app

## Development

- **Hot Reload**: Automatic browser refresh on changes
- **ESLint**: Code linting and formatting
- **Vite**: Fast development build tool

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5050
```

For production, the API URL will be automatically configured.

## Building

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

## Icons

The app includes a modern icon system:
- Replace `public/favicon.png` and `public/favicon.ico` with your custom icons
- The SVG favicon is already optimized and modern
- PWA manifest supports app installation