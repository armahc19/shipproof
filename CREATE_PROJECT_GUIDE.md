# Create Project with GitHub Integration

Complete guide for the new Create Project feature with automatic GitHub integration.

## 🎯 What Was Built

### Backend Features

#### 1. **Database Schema Updates**
- **projects** table: Stores project metadata
- **commits** table: Stores commits for each project
- **pull_requests** table: Stores PRs for each project
- **users** table: Updated to store GitHub access token

#### 2. **GitHub Client** (`github-client.js`)
- `getUserRepositories()` - Fetch user's GitHub repos
- `getRepositoryCommits()` - Fetch commits from a repo
- `getRepositoryPullRequests()` - Fetch PRs from a repo
- `calculateProgress()` - Auto-calculate project progress based on activity

#### 3. **Database Functions** (`db.js`)
- `createProject()` - Create new project
- `getUserProjects()` - Get user's projects
- `saveCommits()` - Store commits in DB
- `savePullRequests()` - Store PRs in DB
- `getProjectActivity()` - Get commit/PR counts
- `updateProjectProgress()` - Calculate and update progress

#### 4. **API Endpoints** (`server.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/repos` | Get user's GitHub repositories |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | Get user's projects |
| GET | `/api/projects/:id` | Get project details with activity |
| POST | `/api/projects/:id/sync` | Re-sync project with GitHub (refresh data) |

### Frontend Features

#### 1. **CreateProjectForm Component** (`CreateProjectForm.tsx`)
- Modal dialog for creating projects
- Form fields:
  - Project Name (required)
  - Description (optional)
  - GitHub Repository (optional with autocomplete)
  - Deadline (optional date picker)
- Real-time repo search with autocomplete
- Shows repo language and stars

#### 2. **Updated DeveloperDashboard**
- Fetches real projects from API (no more mock data)
- Shows stats: Active projects, Total projects, Avg Progress
- Loading state while fetching
- Empty state when no projects exist
- Real-time project progress display

## 🚀 Testing the Feature

### Step 1: Ensure Services Are Running

```bash
# Terminal 1: Backend
cd backend && npm run dev
# Should output: ✅ Database initialized successfully

# Terminal 2: Frontend
cd progress-pulse && npm run dev
# Should output: Port 8080
```

### Step 2: Log In with GitHub

1. Open http://localhost:8080
2. Click "Continue with GitHub"
3. Authorize the app
4. You'll be logged in and see the developer dashboard

### Step 3: Create a Project

1. Click "New Project" button
2. Fill in the form:
   - **Project Name**: "My First Project"
   - **Description**: "Testing the GitHub integration"
   - **GitHub Repo**: Start typing to search (e.g., "node")
   - **Deadline**: Select a date or leave blank
3. Select a repo from the dropdown
4. Click "Create Project"

### Step 4: Watch the Magic Happen

When you create a project with a GitHub repo:
- Backend fetches all commits from that repo
- Backend fetches all pull requests
- Progress is automatically calculated
- Project appears in your dashboard with real data!

## 🧮 Progress Calculation

Progress is calculated using this formula:

```
Score = (Total Commits) + (Total PRs × 5)
Progress = Min((Score / 20) × 100, 100%)
```

**Examples:**
- 20 commits = 100%
- 4 PRs = 100%
- 10 commits + 2 PRs = 10 + (2×5) = 20 = 100%
- 5 commits + 1 PR = 5 + 5 = 10 = 50%

## 📊 Database Structure

```
users (id, github_id, username, github_access_token, ...)
  ↓
projects (id, user_id, name, progress, github_repo, ...)
  ├─ commits (project_id, github_commit_id, message, ...)
  └─ pull_requests (project_id, github_pr_id, title, state, ...)
```

## 🔄 Syncing Projects

To refresh project data from GitHub:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/projects/1/sync
```

This will:
- Fetch latest commits
- Fetch latest PRs
- Recalculate progress
- Update the database

## 🐛 Troubleshooting

### Issue: "No GitHub access token found"
**Solution**: This shouldn't happen after login. Try logging out and logging back in.

### Issue: Repo dropdown is empty
**Solutions**:
- Make sure you have repositories in your GitHub account
- Check GitHub access token is valid
- Check backend console for errors

### Issue: Progress not calculating
**Solutions**:
- Repo must exist and have commits/PRs
- Backend must successfully fetch from GitHub
- Check PostgreSQL has data: `SELECT * FROM commits WHERE project_id = 1;`

### Issue: Database connection error
**Solution**: 
```bash
# Make sure PostgreSQL is running
psql -U postgres -d progress_pulse -c "SELECT NOW();"
```

## 📝 API Examples

### Create a Project

```bash
curl -X POST \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "A test project",
    "github_repo": "username/repo-name",
    "deadline": "2024-12-31"
  }' \
  http://localhost:3000/api/projects
```

### Get User's Projects

```bash
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://localhost:3000/api/projects
```

### Sync a Project

```bash
curl -X POST \
  -H "Authorization: Bearer JWT_TOKEN" \
  http://localhost:3000/api/projects/1/sync
```

## 🔐 Security Notes

- GitHub access tokens are stored in database (consider encrypting in production)
- Tokens are used to fetch private repos if user gives permission
- Only authenticated users can create/view projects
- Users can only see their own projects

## 🚀 Next Steps

1. **Milestones & Tasks**: Link to GitHub issues
2. **Client View**: Show real progress to clients
3. **Automatic Sync**: Webhook to update progress when commits are pushed
4. **Team Collaboration**: Share projects with team members
5. **Analytics Dashboard**: Charts and metrics
6. **Notifications**: Alert clients when progress changes

## 📚 Files Modified/Created

```
backend/
  ├── db.js (updated - added project functions)
  ├── server.js (updated - added project endpoints)
  ├── github-client.js (NEW - GitHub API client)
  └── schema.sql (updated - added tables)

progress-pulse/src/
  ├── pages/
  │   └── DeveloperDashboard.tsx (updated - fetch from API)
  ├── components/
  │   └── CreateProjectForm.tsx (NEW - create project modal)
  ├── config.ts (NEW - API base URL)
  └── pages/
      └── AuthCallback.tsx (existing - handles OAuth)
```

## ✨ Features Summary

✅ Create projects with name, description, deadline
✅ Connect GitHub repositories to projects
✅ Auto-fetch commits and PRs from GitHub
✅ Auto-calculate progress based on activity
✅ Store all data in PostgreSQL
✅ Real-time dashboard updates
✅ Repository search and autocomplete
✅ Sync projects to refresh GitHub data
✅ Beautiful UI with loading states
✅ Empty states and error handling

---

**Status**: MVP Complete! 🎉

Users can now create projects with GitHub integration and see real-time progress based on actual development activity.
