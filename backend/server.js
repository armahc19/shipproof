require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { 
  initializeDatabase, 
  findOrCreateUser, 
  getUserAccessToken,
  createProject,
  getUserProjects,
  getProjectById,
  saveCommits,
  savePullRequests,
  getProjectActivity,
  updateProjectProgress,
  deleteProject
} = require('./db');
const { 
  getUserRepositories, 
  getRepositoryCommits, 
  getRepositoryPullRequests,
  calculateProgress 
} = require('./github-client');

const app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080'],
  credentials: true
}));

app.use(express.json());

/**
 * Middleware: Verify JWT and attach user info
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * STEP 1: Redirect to GitHub
 */
app.get('/auth/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;

  const redirect_uri = `http://localhost:${process.env.PORT || 3000}/auth/github/callback`;

  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=repo,read:org`
  );
});

/**
 * STEP 2: GitHub Callback
 */
app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { 
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // get GitHub user
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const githubUser = userRes.data;

    /**
     * 👉 Save user to DB - Check if user exists or create new one
     */
    const dbUser = await findOrCreateUser(githubUser, accessToken);

    // create JWT
    const token = jwt.sign(
      {
        id: dbUser.github_id,
        dbId: dbUser.id,
        username: dbUser.username,
        avatar: dbUser.avatar_url,
        email: dbUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // redirect to frontend with token
    res.redirect(`http://localhost:8080/dashboard?token=${token}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Auth failed' });
  }
});

/**
 * STEP 3: Protected Route
 */
app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Get all users endpoint (optional - for testing)
 */
app.get('/api/users', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    // User is authenticated, fetch from db
    const { getAllUsers } = require('./db');
    getAllUsers().then(users => {
      res.json(users);
    }).catch(err => {
      res.status(500).json({ error: 'Failed to fetch users' });
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * GET /api/repos - Get user's GitHub repositories
 */
app.get('/api/repos', authMiddleware, async (req, res) => {
  try {
    const accessToken = await getUserAccessToken(req.user.dbId);
    
    if (!accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found' });
    }

    const repos = await getUserRepositories(accessToken);
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/projects - Create a new project
 */
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { name, description, github_repo, deadline } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Create project
    const project = await createProject(req.user.dbId, {
      name,
      description,
      github_repo,
      github_repo_full_name: github_repo,
      deadline: deadline || null
    });

    // If GitHub repo is provided, fetch commits and PRs
    if (github_repo) {
      try {
        const accessToken = await getUserAccessToken(req.user.dbId);
        const [owner, repoName] = github_repo.split('/');  

        // Fetch and save commits
        const commits = await getRepositoryCommits(owner, repoName, accessToken);
        await saveCommits(project.id, commits);

        // Fetch and save PRs
        const prs = await getRepositoryPullRequests(owner, repoName, accessToken);
        await savePullRequests(project.id, prs);

        // Calculate and update progress
        const activity = await getProjectActivity(project.id);
        const progress = calculateProgress(activity.totalCommits, activity.totalPRs);
        await updateProjectProgress(project.id, progress);
      } catch (githubErr) {
        console.warn('⚠️  Warning: Could not fetch GitHub data:', githubErr.message);
        // Don't fail the request, project is created even if GitHub fetch fails
      }
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error('❌ Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * GET /api/projects - Get user's projects
 */
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await getUserProjects(req.user.dbId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id - Get project details
 */
app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get activity
    const activity = await getProjectActivity(project.id);
    
    res.json({ ...project, activity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * GET /api/projects/:id/public - Get project details (PUBLIC - no auth required)
 */
app.get('/api/projects/:id/public', async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get activity
    const activity = await getProjectActivity(project.id);
    
    // Return public data only (no sensitive info)
    res.json({ 
      id: project.id,
      name: project.name,
      description: project.description,
      github_repo: project.github_repo,
      progress: project.progress,
      status: project.status,
      deadline: project.deadline,
      activity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * POST /api/projects/:id/sync - Sync project with GitHub
 */
app.post('/api/projects/:id/sync', authMiddleware, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!project.github_repo) {
      return res.status(400).json({ error: 'Project has no GitHub repository' });
    }

    const accessToken = await getUserAccessToken(req.user.dbId);
    const [owner, repoName] = project.github_repo.split('/');

    // Fetch and save latest commits
    const commits = await getRepositoryCommits(owner, repoName, accessToken);
    await saveCommits(project.id, commits);

    // Fetch and save latest PRs
    const prs = await getRepositoryPullRequests(owner, repoName, accessToken);
    await savePullRequests(project.id, prs);

    // Recalculate progress
    const activity = await getProjectActivity(project.id);
    const progress = calculateProgress(activity.totalCommits, activity.totalPRs);
    const updatedProject = await updateProjectProgress(project.id, progress);

    res.json({ success: true, project: updatedProject, activity });
  } catch (err) {
    console.error('❌ Error syncing project:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/projects/:id - Delete a project
 */
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify the project belongs to the current user
    if (project.user_id !== req.user.dbId) {
      return res.status(403).json({ error: 'Unauthorized to delete this project' });
    }

    await deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('❌ Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.listen(process.env.PORT, async () => {
  try {
    // Initialize database on startup
    await initializeDatabase();
    console.log(`✅ Server running on port ${process.env.PORT}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
});