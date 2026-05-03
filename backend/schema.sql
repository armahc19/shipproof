-- Progress Pulse Database Schema
-- Run this file manually if you want to pre-populate the database

-- Create users table
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

-- Create index on github_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Create projects table (for future use)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  github_repo VARCHAR(255),
  progress INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Create milestones table (for future use)
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);

-- Create tasks table (for future use)
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

-- Sample queries to test the schema
-- SELECT * FROM users;
-- SELECT * FROM projects WHERE user_id = 1;
-- SELECT * FROM milestones WHERE project_id = 1;
-- SELECT * FROM tasks WHERE milestone_id = 1;
