import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/api/auth/login', payload);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/api/github/stats');
  return data;
};

export const getRepos = async () => {
  const { data } = await api.get('/api/github/repos');
  return data;
};

export const getPullRequests = async () => {
  const { data } = await api.get('/api/github/prs');
  return data;
};

export const getContributionGraph = async () => {
  const { data } = await api.get('/api/github/contributions');
  return data;
};

export const getCommits = async (owner, repo) => {
  const { data } = await api.get(`/api/github/commits/${owner}/${repo}`);
  return data;
};

export const getTrackedContributions = async () => {
  const { data } = await api.get('/api/contributions');
  return data;
};

export const createTrackedContribution = async (payload) => {
  const { data } = await api.post('/api/contributions', payload);
  return data;
};

export const updateTrackedContribution = async (id, payload) => {
  const { data } = await api.put(`/api/contributions/${id}`, payload);
  return data;
};

export const deleteTrackedContribution = async (id) => {
  const { data } = await api.delete(`/api/contributions/${id}`);
  return data;
};

export const logout = async () => {
  localStorage.removeItem('token');

  try {
    const { data } = await api.get('/api/auth/logout');
    return data;
  } catch {
    return { message: 'Logged out successfully' };
  }
};
