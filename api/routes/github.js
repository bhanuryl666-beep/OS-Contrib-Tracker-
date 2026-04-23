const express = require('express');
const axios = require('axios');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

const githubHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
});

const githubError = (res, err, fallbackMessage) => {
  const status = err.response?.status || 500;
  const message = err.response?.data?.message || fallbackMessage;

  return res.status(status).json({ message });
};

// Middleware to check if user has GitHub access token
const requireGitHubAuth = (req, res, next) => {
  if (!req.user.accessToken) {
    return res.status(403).json({ message: 'GitHub account not connected. Please login with GitHub.' });
  }
  next();
};

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const buildEmptyContributionDays = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));

    return {
      date: formatDateKey(date),
      count: 0
    };
  });
};

// Get user repos
router.get('/repos', isAuth, requireGitHubAuth, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: githubHeaders(req.user.accessToken),
      params: { per_page: 100, sort: 'updated' }
    });
    res.json(response.data);
  } catch (err) {
    githubError(res, err, 'Failed to fetch repos');
  }
});

// Get user commits for a repo
router.get('/commits/:owner/:repo', isAuth, requireGitHubAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: githubHeaders(req.user.accessToken),
        params: { author: req.user.username, per_page: 50 }
      }
    );
    res.json(response.data);
  } catch (err) {
    githubError(res, err, 'Failed to fetch commits');
  }
});

// Get contribution graph data from recent authored commits
router.get('/contributions', isAuth, requireGitHubAuth, async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 182, 365);
    const contributionDays = buildEmptyContributionDays(days);
    const contributionMap = new Map(contributionDays.map((day) => [day.date, day.count]));
    const since = contributionDays[0].date;
    const headers = githubHeaders(req.user.accessToken);

    // Try search commits first, fallback to repo-based approach
    try {
      const response = await axios.get('https://api.github.com/search/commits', {
        headers,
        params: {
          q: `author:${req.user.username} committer-date:>=${since}`,
          per_page: 100,
          sort: 'committer-date',
          order: 'desc'
        }
      });

      response.data.items.forEach((item) => {
        const date = item.commit?.committer?.date;

        if (!date) {
          return;
        }

        const dateKey = date.slice(0, 10);

        if (contributionMap.has(dateKey)) {
          contributionMap.set(dateKey, contributionMap.get(dateKey) + 1);
        }
      });
    } catch (searchErr) {
      console.warn('Search commits failed, trying alternative approach:', searchErr.message);

      // Fallback: Get user's repos and check recent commits
      try {
        const reposResponse = await axios.get('https://api.github.com/user/repos', {
          headers,
          params: { per_page: 10, sort: 'pushed', direction: 'desc' }
        });

        for (const repo of reposResponse.data.slice(0, 5)) { // Check first 5 repos
          try {
            const commitsResponse = await axios.get(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`,
              {
                headers,
                params: {
                  author: req.user.username,
                  since: since + 'T00:00:00Z',
                  per_page: 20
                }
              }
            );

            commitsResponse.data.forEach((commit) => {
              const date = commit.commit?.committer?.date;
              if (!date) return;

              const dateKey = date.slice(0, 10);
              if (contributionMap.has(dateKey)) {
                contributionMap.set(dateKey, contributionMap.get(dateKey) + 1);
              }
            });
          } catch (repoErr) {
            // Continue to next repo
            console.warn(`Failed to get commits for ${repo.full_name}:`, repoErr.message);
          }
        }
      } catch (reposErr) {
        console.warn('Failed to get repos for contribution graph:', reposErr.message);
      }
    }

    const daysWithCounts = contributionDays.map((day) => ({
      ...day,
      count: contributionMap.get(day.date) || 0
    }));
    const total = daysWithCounts.reduce((sum, day) => sum + day.count, 0);
    const maxCount = Math.max(...daysWithCounts.map((day) => day.count), 0);

    res.json({
      total,
      maxCount,
      days: daysWithCounts
    });
  } catch (err) {
    githubError(res, err, 'Failed to fetch contribution graph');
  }
});

// Get user pull requests
router.get('/prs', isAuth, requireGitHubAuth, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/search/issues', {
      headers: githubHeaders(req.user.accessToken),
      params: {
        q: `type:pr author:${req.user.username}`,
        per_page: 50,
        sort: 'created',
        order: 'desc'
      }
    });
    res.json(response.data);
  } catch (err) {
    githubError(res, err, 'Failed to fetch PRs');
  }
});

// Get contribution stats
router.get('/stats', isAuth, requireGitHubAuth, async (req, res) => {
  try {
    const headers = githubHeaders(req.user.accessToken);

    const [reposRes, userRes, prsRes] = await Promise.all([
      axios.get('https://api.github.com/user/repos', { headers, params: { per_page: 100 } }),
      axios.get('https://api.github.com/user', { headers }),
      axios.get('https://api.github.com/search/issues', {
        headers,
        params: { q: `type:pr author:${req.user.username}`, per_page: 1 }
      })
    ]);

    res.json({
      totalRepos: reposRes.data.length,
      totalPRs: prsRes.data.total_count,
      totalCommits: 0, // Will be calculated from contributions endpoint
      userProfile: {
        username: userRes.data.login,
        name: userRes.data.name,
        bio: userRes.data.bio,
        followers: userRes.data.followers,
        following: userRes.data.following,
        publicRepos: userRes.data.public_repos,
        avatar: userRes.data.avatar_url
      }
    });
  } catch (err) {
    githubError(res, err, 'Failed to fetch stats');
  }
});

module.exports = router;
