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
router.get('/repos', isAuth, async (req, res) => {
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
router.get('/commits/:owner/:repo', isAuth, async (req, res) => {
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
router.get('/contributions', isAuth, async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 182, 365);
    const contributionDays = buildEmptyContributionDays(days);
    const contributionMap = new Map(contributionDays.map((day) => [day.date, day.count]));
    const since = contributionDays[0].date;
    const headers = githubHeaders(req.user.accessToken);

    const response = await axios.get('https://api.github.com/search/commits', {
      headers,
      params: {
        q: `author:${req.user.username} author-date:>=${since}`,
        per_page: 100,
        sort: 'author-date',
        order: 'desc'
      }
    });

    response.data.items.forEach((item) => {
      const date = item.commit?.author?.date;

      if (!date) {
        return;
      }

      const dateKey = date.slice(0, 10);

      if (contributionMap.has(dateKey)) {
        contributionMap.set(dateKey, contributionMap.get(dateKey) + 1);
      }
    });

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
router.get('/prs', isAuth, async (req, res) => {
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
router.get('/stats', isAuth, async (req, res) => {
  try {
    const headers = githubHeaders(req.user.accessToken);

    const [reposRes, prsRes] = await Promise.all([
      axios.get('https://api.github.com/user/repos', { headers, params: { per_page: 100 } }),
      axios.get('https://api.github.com/search/issues', {
        headers,
        params: { q: `type:pr author:${req.user.username}`, per_page: 1 }
      })
    ]);

    res.json({
      totalRepos: reposRes.data.length,
      totalPRs: prsRes.data.total_count,
      username: req.user.username
    });
  } catch (err) {
    githubError(res, err, 'Failed to fetch stats');
  }
});

module.exports = router;
