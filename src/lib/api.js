const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  getStats: () => request('/stats'),
  getJobs: (params) => request(`/jobs?${new URLSearchParams(params)}`),
  getCompanies: () => request('/companies'),
  getScrapeRuns: () => request('/scrape-runs'),
  getScrapeRun: (id) => request(`/scrape-runs/${id}`),
  getCountries: () => request('/countries'),
  getScrapeStatus: () => request('/scrape/status'),
  startScrape: (body) => request('/scrape', { method: 'POST', body: JSON.stringify(body) }),
  startScrapeSync: (body) => request('/scrape/sync', { method: 'POST', body: JSON.stringify(body) }),
  findEmails: (limit) => request('/find-emails', { method: 'POST', body: JSON.stringify({ limit }) }),
  getCampaigns: () => request('/campaigns'),
  createCampaign: (body) => request('/campaigns', { method: 'POST', body: JSON.stringify(body) }),
  sendCampaign: (id) => request(`/campaigns/${id}/send`, { method: 'POST' }),
  getCampaignLogs: (id) => request(`/campaigns/${id}/logs`),
  verifySmtp: () => request('/smtp/verify'),
};
