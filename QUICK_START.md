# Quick Start Checklist

## PostgreSQL Setup

- [ ] Install PostgreSQL (or Docker)
- [ ] Start PostgreSQL service
- [ ] Create database: `progress_pulse`
- [ ] Verify connection

## Backend Configuration

- [ ] Check `.env` file has PostgreSQL credentials
- [ ] Run `npm install` in backend folder
- [ ] Backend has `db.js` file
- [ ] Backend `server.js` imports db functions

## Start Services

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
✅ Wait for: `✅ Database initialized successfully`

### Terminal 2: Frontend
```bash
cd progress-pulse
npm run dev
```
✅ Wait for: Port 8080 is ready

## Test OAuth Flow

1. Open http://localhost:8080
2. Click "Continue with GitHub"
3. Sign in with your GitHub account
4. Should redirect to dashboard
5. Check database:
   ```bash
   psql -U postgres -d progress_pulse -c "SELECT * FROM users;"
   ```
   You should see your user record!

## Verify Setup

```bash
# Check backend logs for database success
# Check browser console for token in localStorage

# Check PostgreSQL has your data
psql -U postgres -d progress_pulse
SELECT * FROM users;
SELECT COUNT(*) FROM users;
\q
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` | PostgreSQL not running - start it |
| `password authentication failed` | Check .env credentials |
| `does not exist` | Create database with `CREATE DATABASE progress_pulse;` |
| `port already in use` | Change PORT in .env or kill process using port |
| Frontend redirects to port 3000 instead of 8080 | Check `.env.local` has correct API_BASE_URL |

## Files Created/Modified

```
backend/
  ├── server.js (updated - with db integration)
  ├── db.js (NEW - database setup)
  ├── .env (updated - PostgreSQL config)
  └── package.json (already has pg)

progress-pulse/
  ├── src/
  │   └── pages/
  │       └── AuthCallback.tsx (NEW)
  ├── src/App.tsx (updated - auth route)
  ├── src/config.ts (NEW - API config)
  └── .env.local (NEW - API URL)

docs/
  ├── OAUTH_SETUP.md (OAuth flow guide)
  └── POSTGRES_SETUP.md (PostgreSQL setup)
```

## What Now Happens on OAuth

1. User signs in with GitHub
2. Backend receives GitHub user data
3. **Backend saves/updates user in PostgreSQL** ← NEW!
4. Backend creates JWT with user info
5. Frontend stores token and redirects to dashboard
6. User data persists in database

## Next Features to Add

- [ ] Create projects table
- [ ] Create milestones table
- [ ] Create tasks table
- [ ] Link projects to users
- [ ] API endpoints to fetch/create projects
- [ ] Frontend integration with real data
