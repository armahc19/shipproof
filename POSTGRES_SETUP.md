# PostgreSQL Setup Guide

## Overview

This guide walks you through setting up PostgreSQL for the Progress Pulse backend to store user data from GitHub OAuth authentication.

## Prerequisites

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow prompts
- PostgreSQL will run as a service

**Docker (Recommended):**
```bash
docker run --name progress-pulse-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=progress_pulse \
  -p 5432:5432 \
  -d postgres:latest
```

## Setup Steps

### Step 1: Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE progress_pulse;

# Create user (if using different credentials, update .env)
CREATE USER postgres WITH PASSWORD 'postgres';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE progress_pulse TO postgres;

# Exit
\q
```

### Step 2: Configure Backend

Update `.env` in the backend folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=progress_pulse
DB_USER=postgres
DB_PASSWORD=postgres
```

### Step 3: Install Dependencies

```bash
cd backend
npm install pg
```

### Step 4: Start Backend

```bash
npm run dev
```

**Expected output:**
```
✅ Database initialized successfully
✅ Server running on port 3000
```

The database will automatically:
- ✅ Create `users` table if it doesn't exist
- ✅ Create indexes for fast lookups
- ✅ Run migrations on every startup

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  github_id INTEGER UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `github_id` - Unique GitHub user ID
- `username` - GitHub username
- `email` - User's email (from GitHub)
- `avatar_url` - GitHub profile picture
- `bio` - GitHub bio
- `created_at` - When user first signed up
- `updated_at` - Last profile update

## OAuth Flow with Database

```
1. User clicks "Continue with GitHub"
   ↓
2. Backend redirects to GitHub OAuth
   ↓
3. User authorizes on GitHub
   ↓
4. GitHub redirects back with auth code
   ↓
5. Backend exchanges code for access token
   ↓
6. Backend fetches user data from GitHub API
   ↓
7. Backend checks if user exists in DB
   ├─ If EXISTS → Update user profile
   └─ If NOT → Create new user record
   ↓
8. Backend creates JWT token
   ↓
9. Backend redirects to frontend with token
   ↓
10. Frontend stores token & user redirected to dashboard
```

## Testing Database

### Connect to Database

```bash
psql -U postgres -d progress_pulse
```

### View Users Table

```sql
SELECT * FROM users;
```

### View Specific User

```sql
SELECT * FROM users WHERE username = 'your_github_username';
```

### Check Connection

```bash
# From backend folder
node -e "const db = require('./db'); db.pool.query('SELECT NOW()', (err, res) => { if(err) console.error(err); else console.log('✅ Connected:', res.rows[0].now); process.exit(); })"
```

## API Endpoints

### Check Current User
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/me
```

### Get All Users (Protected)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/users
```

## Troubleshooting

### Connection Refused
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
# Or restart Docker container
```

### Authentication Failed
```
❌ Error: password authentication failed for user "postgres"
```
**Solution:** Check .env credentials match your PostgreSQL setup

### Database Already Exists
```
❌ Error: database "progress_pulse" already exists
```
**Solution:** The database exists from a previous run (this is OK - tables will be created/updated on startup)

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d progress_pulse

# List all databases
\l

# List all tables
\dt

# Describe users table
\d users

# View all users
SELECT * FROM users;

# Count users
SELECT COUNT(*) FROM users;

# Delete all users (CAREFUL!)
DELETE FROM users;

# Drop database
DROP DATABASE progress_pulse;

# Exit
\q
```

## Next Steps

After PostgreSQL is set up and running:

1. Test GitHub OAuth flow at http://localhost:8080
2. Sign in with your GitHub account
3. Check database: `SELECT * FROM users;` in psql
4. Your user should appear in the database!

## Additional Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js pg library: https://node-postgres.com/
- Database design best practices: https://www.postgresql.org/docs/current/sql-createtable.html
