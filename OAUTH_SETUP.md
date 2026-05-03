# GitHub OAuth Setup

## Flow Overview

1. **Frontend** (localhost:8080): User clicks "Continue with GitHub"
2. **Backend** (localhost:3000): Redirects to GitHub OAuth authorization
3. **GitHub**: User grants permissions
4. **GitHub** → **Backend**: Redirects with authorization code
5. **Backend**: Exchanges code for access token, fetches user info, creates JWT
6. **Backend** → **Frontend**: Redirects with JWT token in URL
7. **Frontend** (AuthCallback): Captures token, saves to localStorage, redirects to dashboard

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Make sure .env has:
# PORT=3000
# GITHUB_CLIENT_ID=Ov23li2deG0Wr9bLFJPL
# GITHUB_CLIENT_SECRET=4dc46cb859c96cee2796238e39cd895c8cefdb3e
# JWT_SECRET=supersecretkey

# Start backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
```

### 2. Frontend Setup

```bash
cd progress-pulse

# Make sure .env.local has:
# VITE_API_BASE_URL=http://localhost:3000

# Start frontend
npm run dev
```

**Expected output:**
```
Port 8080
```

### 3. Test OAuth Flow

1. Open **http://localhost:8080** in browser
2. Click **"Continue with GitHub"** button
3. You'll be redirected to GitHub login
4. After authorizing, you'll be redirected back to dashboard
5. Token will be stored in localStorage under `auth_token`

## What Was Fixed

✅ **Backend CORS** - Now accepts requests from localhost:8080  
✅ **Redirect URI** - Now uses environment variable PORT dynamically  
✅ **Frontend Config** - Created `.env.local` with API_BASE_URL  
✅ **Auth Callback** - New route to handle token from backend  
✅ **Token Storage** - Token saved to localStorage for authenticated requests  

## Next Steps

- Create auth context to manage user state across app
- Add token to API requests via Authorization header
- Implement logout functionality
- Add user profile display
- Implement protected routes
