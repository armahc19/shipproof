const { Pool } = require('pg');

/*const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});*/

//const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});


/**
 * Initialize database tables
 */
async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        github_id INTEGER UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        avatar_url VARCHAR(255),
        bio TEXT,
        github_access_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        github_repo VARCHAR(255),
        github_repo_full_name VARCHAR(255),
        progress INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create commits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        github_commit_id VARCHAR(255) UNIQUE,
        message TEXT,
        author VARCHAR(255),
        url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create pull_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pull_requests (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        github_pr_id INTEGER UNIQUE,
        title VARCHAR(255),
        number INTEGER,
        state VARCHAR(50),
        url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_commits_project_id ON commits(project_id);
      CREATE INDEX IF NOT EXISTS idx_prs_project_id ON pull_requests(project_id);
    `);

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
}

/**
 * Find or create user
 */

async function findOrCreateUser(githubUser, accessToken) {
  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubUser.id]
    );

    if (existingUser.rows.length > 0) {
      // Always update token on login - returns fresh data with updated token
      const result = await pool.query(
        `UPDATE users 
         SET username = $1,
             avatar_url = $2,
             github_access_token = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE github_id = $4
         RETURNING *`,
        [
          githubUser.login,
          githubUser.avatar_url,
          accessToken,
          githubUser.id
        ]
      );

      return result.rows[0];
    }

    const result = await pool.query(
      `INSERT INTO users (github_id, username, avatar_url, github_access_token)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        githubUser.id,
        githubUser.login,
        githubUser.avatar_url,
        accessToken
      ]
    );

    return result.rows[0];

  } catch (err) {
    console.error('❌ Error finding/creating user:', err);
    throw err;
  }
}
/*
async function findOrCreateUser(githubUser, accessToken) {
  try {
    // First, check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubUser.id]
    );

    if (existingUser.rows.length > 0) {
      // User exists, update their profile and token
      const user = existingUser.rows[0];
      await pool.query(
        `UPDATE users 
         SET avatar_url = $1, email = $2, bio = $3, github_access_token = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE github_id = $5`,
        [githubUser.avatar_url, githubUser.email, githubUser.bio, accessToken, githubUser.id]
      );
      return user;
    } else {
      // Create new user
      const result = await pool.query(
        `INSERT INTO users (github_id, username, email, avatar_url, bio, github_access_token) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          githubUser.id,
          githubUser.login,
          githubUser.email,
          githubUser.avatar_url,
          githubUser.bio,
          accessToken
        ]
      );
      return result.rows[0];
    }
  } catch (err) {
    console.error('❌ Error finding/creating user:', err);
    throw err;
  }
}
*/
/**
 * Get user by GitHub ID
 */
async function getUserByGithubId(githubId) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE github_id = $1',
      [githubId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    throw err;
  }
}

/**
 * Get user's GitHub access token
 */
async function getUserAccessToken(userId) {
  try {
    const result = await pool.query(
      'SELECT github_access_token FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.github_access_token || null;
  } catch (err) {
    console.error('❌ Error fetching access token:', err);
    throw err;
  }
}

/**
 * Get all users
 */
async function getAllUsers() {
  try {
    const result = await pool.query('SELECT id, username, email, avatar_url, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    throw err;
  }
}

/**
 * Create a new project
 */
async function createProject(userId, projectData) {
  try {
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description, github_repo, github_repo_full_name, deadline, status, progress)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', 0)
       RETURNING *`,
      [userId, projectData.name, projectData.description, projectData.github_repo, projectData.github_repo_full_name, projectData.deadline]
    );
    return result.rows[0];
  } catch (err) {
    console.error('❌ Error creating project:', err);
    throw err;
  }
}

/**
 * Get user's projects
 */
async function getUserProjects(userId) {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    throw err;
  }
}

/**
 * Get project by ID
 */
async function getProjectById(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ Error fetching project:', err);
    throw err;
  }
}

/**
 * Save commits for a project
 */
async function saveCommits(projectId, commits) {
  try {
    for (const commit of commits) {
      await pool.query(
        `INSERT INTO commits (project_id, github_commit_id, message, author, url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (github_commit_id) DO NOTHING`,
        [projectId, commit.sha, commit.commit.message, commit.commit.author.name, commit.html_url]
      );
    }
    console.log(`✅ Saved ${commits.length} commits`);
  } catch (err) {
    console.error('❌ Error saving commits:', err);
    throw err;
  }
}

/**
 * Save pull requests for a project
 */
async function savePullRequests(projectId, prs) {
  try {
    for (const pr of prs) {
      await pool.query(
        `INSERT INTO pull_requests (project_id, github_pr_id, title, number, state, url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (github_pr_id) DO NOTHING`,
        [projectId, pr.id, pr.title, pr.number, pr.state, pr.html_url]
      );
    }
    console.log(`✅ Saved ${prs.length} pull requests`);
  } catch (err) {
    console.error('❌ Error saving PRs:', err);
    throw err;
  }
}

/**
 * Get project activity (commits + PRs)
 */
async function getProjectActivity(projectId) {
  try {
    // Get commits with details
    const commitsRes = await pool.query(
      'SELECT * FROM commits WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50',
      [projectId]
    );
    
    // Get PRs with details
    const prsRes = await pool.query(
      'SELECT * FROM pull_requests WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50',
      [projectId]
    );
    
    // Combine and sort by date for timeline
    const timeline = [
      ...commitsRes.rows.map(c => ({
        id: `commit-${c.id}`,
        type: 'commit',
        message: c.message,
        author: c.author,
        url: c.url,
        timestamp: c.created_at,
        count: 1 // We'll group these later
      })),
      ...prsRes.rows.map(p => ({
        id: `pr-${p.id}`,
        type: p.state === 'merged' ? 'merge' : 'pr',
        title: p.title,
        state: p.state,
        number: p.number,
        url: p.url,
        timestamp: p.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      totalCommits: commitsRes.rows.length,
      totalPRs: prsRes.rows.length,
      commits: commitsRes.rows,
      pullRequests: prsRes.rows,
      timeline: timeline
    };
  } catch (err) {
    console.error('❌ Error fetching activity:', err);
    throw err;
  }
}

/**
 * Update project progress
 */
async function updateProjectProgress(projectId, progress) {
  try {
    const result = await pool.query(
      `UPDATE projects SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [progress, projectId]
    );
    return result.rows[0];
  } catch (err) {
    console.error('❌ Error updating progress:', err);
    throw err;
  }
}

/**
 * Delete a project and related data (commits, PRs)
 */
async function deleteProject(projectId) {
  try {
    // Delete related commits and PRs first
    await pool.query('DELETE FROM commits WHERE project_id = $1', [projectId]);
    await pool.query('DELETE FROM pull_requests WHERE project_id = $1', [projectId]);
    
    // Then delete the project
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [projectId]
    );
    return result.rows[0];
  } catch (err) {
    console.error('❌ Error deleting project:', err);
    throw err;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  findOrCreateUser,
  getUserByGithubId,
  getUserAccessToken,
  getAllUsers,
  createProject,
  getUserProjects,
  getProjectById,
  saveCommits,
  savePullRequests,
  getProjectActivity,
  updateProjectProgress,
  deleteProject,
};
