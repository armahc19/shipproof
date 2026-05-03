const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch user's repositories
 */
async function getUserRepositories(accessToken) {
  try {
    let allRepos = [];
    let page = 1;
    let hasMore = true;

    // Fetch all pages
    while (hasMore) {
      const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          //type: 'all', // all repos: owned, collaborator, member, and organization
          visibility: 'all', // Explicitly asks for public and private
          sort: 'updated',
          per_page: 100,
          page: page,
        },
      });

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        allRepos = allRepos.concat(response.data);
        page++;
      }
    }

    console.log(`✅ Fetched ${allRepos.length} repositories`);

    return allRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      is_private: repo.private,
    }));
  } catch (err) {
    console.error('❌ Error fetching repos:', err.message);
    throw new Error('Failed to fetch GitHub repositories');
  }
}

/**
 * Fetch commits for a repository
 */
async function getRepositoryCommits(owner, repo, accessToken, since = null) {
  try {
    const params = {
      per_page: 100,
      sort: 'committer-date',
      direction: 'desc',
    };

    if (since) {
      params.since = since;
    }

    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params,
      }
    );

    return response.data;
  } catch (err) {
    console.error('❌ Error fetching commits:', err.message);
    throw new Error('Failed to fetch commits');
  }
}

/**
 * Fetch pull requests for a repository
 */
async function getRepositoryPullRequests(owner, repo, accessToken) {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          state: 'all',
          per_page: 100,
          sort: 'updated',
          direction: 'desc',
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('❌ Error fetching PRs:', err.message);
    throw new Error('Failed to fetch pull requests');
  }
}

/**
 * Calculate progress based on activity
 * Simple formula: (commits + PRs * 5) / (initial target)
 */
function calculateProgress(commits, prs) {
  const baseTarget = 20; // 20 commits or 4 PRs = 100% progress
  const score = commits + prs * 5;
  const progress = Math.min(Math.round((score / baseTarget) * 100), 100);
  return progress;
}

module.exports = {
  getUserRepositories,
  getRepositoryCommits,
  getRepositoryPullRequests,
  calculateProgress,
};
