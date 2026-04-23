import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ExternalLink,
  Flame,
  GitCommitHorizontal,
  GitFork,
  Github,
  GitPullRequest,
  LogOut,
  Repeat2,
  Star,
  Trash2
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  createTrackedContribution,
  deleteTrackedContribution,
  getCommits,
  getContributionGraph,
  getCurrentUser,
  getPullRequests,
  getRepos,
  getStats,
  getTrackedContributions,
  loginUser,
  logout,
  registerUser,
  updateTrackedContribution
} from './api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const loginUrl = '/api/auth/github';
const emptyContribution = {
  title: '',
  repository: '',
  type: 'commit',
  status: 'planned',
  url: '',
  notes: ''
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function contributionLevel(count, maxCount) {
  if (count === 0 || maxCount === 0) {
    return 0;
  }

  return Math.min(4, Math.ceil((count / maxCount) * 4));
}

function calculateCurrentStreak(days = []) {
  let streak = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count === 0) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function generateWeeklyData(days = []) {
  const weeks = [];
  const weekLabels = [];

  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    const weekTotal = week.reduce((sum, day) => sum + day.count, 0);
    weeks.push(weekTotal);

    // Label as "Week X" or date range
    const startDate = new Date(week[0]?.date);
    const endDate = new Date(week[week.length - 1]?.date);
    const label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    weekLabels.push(label);
  }

  return { weeks, weekLabels };
}

function WeeklyChart({ graph }) {
  if (!graph || !graph.days || graph.days.length === 0) {
    return (
      <section className="content-card chart-card">
        <div className="section-heading">
          <h2>Weekly Commits Chart</h2>
          <CalendarDays size={22} />
        </div>
        <p className="empty-state">No contribution data available for chart.</p>
      </section>
    );
  }

  const { weeks, weekLabels } = generateWeeklyData(graph.days);

  const data = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Commits per Week',
        data: weeks,
        backgroundColor: 'rgba(255, 122, 69, 0.6)',
        borderColor: 'rgba(255, 122, 69, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Commit Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <section className="content-card chart-card">
      <div className="section-heading">
        <h2>Weekly Commits Chart</h2>
        <CalendarDays size={22} />
      </div>
      <Bar data={data} options={options} />
    </section>
  );
}

function ContributionGraph({ graph }) {
  if (!graph || !graph.days || graph.days.length === 0) {
    return (
      <section className="content-card contribution-card">
        <div className="section-heading">
          <div>
            <h2>Contribution Graph</h2>
            <p>No contribution data available.</p>
          </div>
          <CalendarDays size={22} />
        </div>
        <p className="empty-state">Connect GitHub to view your contribution graph.</p>
      </section>
    );
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - graph.days.length + 1);

  const values = graph.days.map(day => ({
    date: day.date,
    count: day.count
  }));

  return (
    <section className="content-card contribution-card">
      <div className="section-heading">
        <div>
          <h2>Contribution Graph</h2>
          <p>{graph.total} commits tracked across the last {graph.days.length} days.</p>
        </div>
        <CalendarDays size={22} />
      </div>

      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={values}
          classForValue={(value) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            return `color-scale-${Math.min(4, Math.ceil((value.count / graph.maxCount) * 4))}`;
          }}
          tooltipDataAttrs={(value) => ({
            'data-tip': value ? `${value.count} commits on ${value.date}` : 'No contributions'
          })}
          showWeekdayLabels={true}
          showMonthLabels={true}
        />
      </div>

      <div className="graph-legend" aria-hidden="true">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i className={`color-scale-${level}`} key={level} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}

function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showAccountChoice, setShowAccountChoice] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const data = isRegister ? await registerUser(form) : await loginUser(form);
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setMessage(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <main className="landing-shell">
      <section className="hero auth-hero">
        <div className="hero-copy">
          <span className="eyebrow">MERN JWT Dashboard</span>
          <h1>{isRegister ? 'Create your tracker account.' : 'Login to your tracker.'}</h1>
          <p>
            Use JWT authentication for the project requirement, then optionally connect GitHub
            to analyze live open-source activity.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          {isRegister && (
            <label>
              Username
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                placeholder="bhanu"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimum 6 characters"
            />
          </label>

          {message && <p className="empty-state error">{message}</p>}

          <button className="primary-action" type="submit">
            {isRegister ? 'Create Account' : 'Login'}
          </button>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Register'}</Link>
          </p>

          <button className="ghost-button" type="button" onClick={() => setShowAccountChoice(true)}>
            <Github size={18} />
            Continue with GitHub
          </button>

          {showAccountChoice && (
            <div className="account-choice-card compact-card">
              <strong>Which GitHub account?</strong>
              <p>GitHub uses your active browser session. Sign out first to choose another GitHub account.</p>
              <div className="account-choice-actions">
                <a className="primary-action compact" href={loginUrl}>
                  Use current GitHub account
                </a>
                <button
                  className="ghost-button compact"
                  type="button"
                  onClick={() => {
                    window.location.href = 'https://github.com/logout';
                  }}
                >
                  Choose another account
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function Dashboard({ user, onLogout, onSwitchAccount }) {
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [contributionGraph, setContributionGraph] = useState(null);
  const [tracked, setTracked] = useState([]);
  const [trackedForm, setTrackedForm] = useState(emptyContribution);
  const [editingId, setEditingId] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [commitsStatus, setCommitsStatus] = useState('idle');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('analyze');
  const currentStreak = calculateCurrentStreak(contributionGraph?.days);

  const loadTracked = async () => {
    const trackedData = await getTrackedContributions();
    setTracked(trackedData);
  };

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [trackedData, statsResult, reposResult, prsResult, graphResult] = await Promise.all([
          getTrackedContributions(),
          getStats().catch((err) => {
            console.error('Failed to fetch stats:', err);
            if (err.response?.status === 403) {
              setError('GitHub account not connected. Please connect your GitHub account to view statistics.');
            }
            return null;
          }),
          getRepos().catch((err) => {
            console.error('Failed to fetch repos:', err);
            if (err.response?.status === 403) {
              return [];
            }
            return [];
          }),
          getPullRequests().catch((err) => {
            console.error('Failed to fetch PRs:', err);
            if (err.response?.status === 403) {
              return { items: [] };
            }
            return { items: [] };
          }),
          getContributionGraph().catch((err) => {
            console.error('Failed to fetch contribution graph:', err);
            if (err.response?.status === 403) {
              return null;
            }
            return null;
          })
        ]);

        if (!ignore) {
          setTracked(trackedData);
          const statsWithCommits = statsResult ? {
            ...statsResult,
            totalCommits: graphResult?.total || 0
          } : null;
          setStats(statsWithCommits);
          setUserProfile(statsResult?.userProfile || null);
          setRepos(reposResult.slice(0, 8));
          setPullRequests(prsResult.items?.slice(0, 6) || []);
          setContributionGraph(graphResult);
          setStatus('ready');
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to load dashboard data.');
          setStatus('error');
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRepoSelect = async (repo) => {
    const [owner, repoName] = repo.full_name.split('/');

    setSelectedRepo(repo);
    setCommits([]);
    setCommitsStatus('loading');

    try {
      const commitsData = await getCommits(owner, repoName);
      setCommits(commitsData.slice(0, 8));
      setCommitsStatus('ready');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load commits for this repository.');
      setCommitsStatus('error');
    }
  };

  const handleContributionSubmit = async (event) => {
    event.preventDefault();

    if (editingId) {
      await updateTrackedContribution(editingId, trackedForm);
    } else {
      await createTrackedContribution(trackedForm);
    }

    setTrackedForm(emptyContribution);
    setEditingId(null);
    await loadTracked();
  };

  const handleEditContribution = (item) => {
    setEditingId(item._id);
    setTrackedForm({
      title: item.title,
      repository: item.repository,
      type: item.type,
      status: item.status,
      url: item.url || '',
      notes: item.notes || ''
    });
  };

  const handleDeleteContribution = async (id) => {
    await deleteTrackedContribution(id);
    await loadTracked();
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="profile-chip">
          {user.avatar ? <img src={user.avatar} alt={user.username} /> : <Github size={28} />}
          <div>
            <span>Welcome back</span>
            <strong>{user.displayName || user.username}</strong>
            {userProfile ? (
              <small style={{ color: 'var(--green)' }}>✓ GitHub Connected</small>
            ) : (
              <small style={{ color: 'var(--accent)' }}>⚠ GitHub Not Connected</small>
            )}
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={onSwitchAccount}>
            <Repeat2 size={18} />
            Switch GitHub account
          </button>
          <button className="ghost-button" type="button" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Contribution Overview</span>
          <h1>Your open source activity</h1>
          <div className="dashboard-actions">
            <button
              className={`view-action ${activeView === 'analyze' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('analyze')}
            >
              Fetch GitHub Data
            </button>
            <button
              className={`view-action ${activeView === 'track' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('track')}
            >
              Manual Tracking
            </button>
          </div>
        </div>
        {user.profileUrl && (
          <a className="profile-link" href={user.profileUrl} target="_blank" rel="noreferrer">
            View GitHub
            <ExternalLink size={16} />
          </a>
        )}
      </section>

      {status === 'loading' && <p className="status-card">Loading your dashboard...</p>}
      {status === 'error' && <p className="status-card error">{error}</p>}

      {status === 'ready' && (
        <>
          {!userProfile && (
            <section className="user-profile-section">
              <article className="content-card">
                <div className="section-heading">
                  <h2>GitHub Connection Required</h2>
                </div>
                <p className="empty-state error">
                  To view your GitHub statistics and contribution graph, please connect your GitHub account.
                  Go to your profile settings or re-login with GitHub.
                </p>
                <button className="primary-action" onClick={onSwitchAccount}>
                  Connect GitHub Account
                </button>
              </article>
            </section>
          )}

          {userProfile && (
            <section className="user-profile-section">
              <article className="content-card user-profile-card">
                <div className="profile-header">
                  <img src={userProfile.avatar} alt={userProfile.username} className="profile-avatar" />
                  <div className="profile-info">
                    <h2>{userProfile.name || userProfile.username}</h2>
                    <p className="profile-username">@{userProfile.username}</p>
                    {userProfile.bio && <p className="profile-bio">{userProfile.bio}</p>}
                    <div className="profile-stats">
                      <span><strong>{userProfile.followers}</strong> followers</span>
                      <span><strong>{userProfile.following}</strong> following</span>
                      <span><strong>{userProfile.publicRepos}</strong> repositories</span>
                    </div>
                  </div>
                </div>
              </article>
            </section>
          )}

          {activeView === 'analyze' && (
            <section className="view-panel" aria-label="Analyze contribution activity">
              <section className="stats-grid">
                <StatCard label="Repositories" value={stats ? stats.totalRepos : '...'} icon={GitFork} />
                <StatCard label="Pull Requests" value={stats ? stats.totalPRs : '...'} icon={GitPullRequest} />
                <StatCard label="Total Commits" value={stats ? stats.totalCommits : '...'} icon={GitCommitHorizontal} />
                <StatCard label="Current Streak" value={contributionGraph ? `${currentStreak} days` : '...'} icon={Flame} />
              </section>
              {contributionGraph ? (
                <>
                  <ContributionGraph graph={contributionGraph} />
                  <WeeklyChart graph={contributionGraph} />
                </>
              ) : (
                <p className="status-card">Connect GitHub to analyze live contribution graph data.</p>
              )}
            </section>
          )}

          {activeView === 'track' && (
            <section className="view-panel" aria-label="Track repositories, pull requests, and commits">
              <section className="content-grid">
                <article className="content-card">
                  <div className="section-heading">
                    <h2>Manual CRUD tracker</h2>
                    <span>{tracked.length} saved</span>
                  </div>
                  <form className="crud-form" onSubmit={handleContributionSubmit}>
                    <input
                      value={trackedForm.title}
                      onChange={(event) => setTrackedForm({ ...trackedForm, title: event.target.value })}
                      placeholder="Contribution title"
                      required
                    />
                    <input
                      value={trackedForm.repository}
                      onChange={(event) => setTrackedForm({ ...trackedForm, repository: event.target.value })}
                      placeholder="owner/repository"
                      required
                    />
                    <select
                      value={trackedForm.type}
                      onChange={(event) => setTrackedForm({ ...trackedForm, type: event.target.value })}
                    >
                      <option value="commit">Commit</option>
                      <option value="pull_request">Pull Request</option>
                      <option value="issue">Issue</option>
                      <option value="repository">Repository</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={trackedForm.status}
                      onChange={(event) => setTrackedForm({ ...trackedForm, status: event.target.value })}
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <input
                      value={trackedForm.url}
                      onChange={(event) => setTrackedForm({ ...trackedForm, url: event.target.value })}
                      placeholder="Optional URL"
                    />
                    <textarea
                      value={trackedForm.notes}
                      onChange={(event) => setTrackedForm({ ...trackedForm, notes: event.target.value })}
                      placeholder="Notes"
                    />
                    <button className="primary-action compact" type="submit">
                      {editingId ? 'Update Contribution' : 'Create Contribution'}
                    </button>
                  </form>
                  <div className="commit-list">
                    {tracked.map((item) => (
                      <div className={`commit-row status-${item.status}`} key={item._id}>
                        <GitCommitHorizontal size={18} />
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.repository} · {item.type} · <span className={`status-badge status-${item.status}`}>{item.status}</span></p>
                        </div>
                        <button className="mini-button" type="button" onClick={() => handleEditContribution(item)}>
                          Edit
                        </button>
                        <button className="mini-button danger" type="button" onClick={() => handleDeleteContribution(item._id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {tracked.length === 0 && <p className="empty-state">No manual contributions yet.</p>}
                  </div>
                </article>

                <article className="content-card">
                  <div className="section-heading">
                    <h2>Recent repositories</h2>
                    <span>{repos.length} shown</span>
                  </div>
                  <div className="repo-list">
                    {repos.map((repo) => (
                      <button
                        key={repo.id}
                        className={`repo-row ${selectedRepo?.id === repo.id ? 'active' : ''}`}
                        type="button"
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <div>
                          <strong>{repo.full_name}</strong>
                          <p>{repo.description || 'No description available'}</p>
                        </div>
                        <div className="repo-actions">
                          <span>
                            <Star size={15} />
                            {repo.stargazers_count}
                          </span>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`Open ${repo.full_name} on GitHub`}
                          >
                            <ExternalLink size={15} />
                          </a>
                        </div>
                      </button>
                    ))}
                    {repos.length === 0 && <p className="empty-state">No repositories found. Connect GitHub to load your repositories.</p>}
                  </div>
                </article>
              </section>

              <section className="content-grid">
                <article className="content-card">
                  <div className="section-heading">
                    <h2>Recent pull requests</h2>
                    <span>{pullRequests.length} shown</span>
                  </div>
                  <div className="pr-list">
                    {pullRequests.map((pr) => (
                      <a key={pr.id} className="pr-row" href={pr.html_url} target="_blank" rel="noreferrer">
                        <GitPullRequest size={18} />
                        <div>
                          <strong>{pr.title}</strong>
                          <p>{pr.repository_url?.split('/repos/')[1] || 'GitHub repository'}</p>
                        </div>
                      </a>
                    ))}
                    {pullRequests.length === 0 && <p className="empty-state">No pull requests loaded.</p>}
                  </div>
                </article>

                <article className="content-card">
                  <div className="section-heading">
                    <div>
                      <h2>Repository commits</h2>
                      <p>
                        {selectedRepo
                          ? `Recent commits by @${user.username} in ${selectedRepo.full_name}`
                          : 'Select a repository to inspect commits.'}
                      </p>
                    </div>
                    {selectedRepo && <span>{commits.length} shown</span>}
                  </div>
                  {commitsStatus === 'idle' && <p className="empty-state">Choose a repository from the list above.</p>}
                  {commitsStatus === 'loading' && <p className="empty-state">Loading commits...</p>}
                  {commitsStatus === 'error' && <p className="empty-state error">{error}</p>}
                  {commitsStatus === 'ready' && (
                    <div className="commit-list">
                      {commits.map((commit) => (
                        <a key={commit.sha} className="commit-row" href={commit.html_url} target="_blank" rel="noreferrer">
                          <GitCommitHorizontal size={18} />
                          <div>
                            <strong>{commit.commit.message.split('\n')[0]}</strong>
                            <p>{new Date(commit.commit.author?.date).toLocaleDateString()}</p>
                          </div>
                          <code>{commit.sha.slice(0, 7)}</code>
                        </a>
                      ))}
                      {commits.length === 0 && <p className="empty-state">No commits found for this repository.</p>}
                    </div>
                  )}
                </article>
              </section>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getCurrentUser()
      .then((data) => {
        if (!ignore) {
          setUser(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  const handleSwitchAccount = async () => {
    await logout();
    setUser(null);
    window.location.href = 'https://github.com/logout';
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard user={user} onLogout={handleLogout} onSwitchAccount={handleSwitchAccount} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
