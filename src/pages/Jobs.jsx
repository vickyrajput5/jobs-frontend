import { useEffect, useState } from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { COUNTRY_NAMES } from '../components/ui';

const STATUS_COLORS = {
  scraped: 'bg-gray-700 text-gray-300',
  email_found: 'bg-blue-500/20 text-blue-400',
  email_verified: 'bg-emerald-500/20 text-emerald-400',
  emailed: 'bg-purple-500/20 text-purple-400',
  failed: 'bg-red-500/20 text-red-400',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ country: '', status: '', source: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filters.country) params.country = filters.country;
    if (filters.status) params.status = filters.status;
    if (filters.source) params.source = filters.source;

    api.getJobs(params)
      .then((res) => {
        setJobs(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, filters]);

  return (
    <div data-testid="jobs-page">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Jobs ({total})</h2>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          data-testid="filter-country"
          value={filters.country}
          onChange={(e) => { setFilters({ ...filters, country: e.target.value }); setPage(1); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Countries</option>
          {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
        <select
          data-testid="filter-status"
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {['scraped', 'email_found', 'email_verified', 'emailed', 'failed'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          data-testid="filter-source"
          value={filters.source}
          onChange={(e) => { setFilters({ ...filters, source: e.target.value }); setPage(1); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Sources</option>
          {['indeed', 'bayt', 'naukrigulf', 'jsearch', 'linkedin'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500" data-testid="jobs-loading">Loading...</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const email = job.companies?.company_emails?.[0];
            return (
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4" data-testid={`job-card-${job.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{job.company_name} · {COUNTRY_NAMES[job.country] || job.country} · {job.location}</p>
                    {job.salary && <p className="text-sm text-emerald-400 mt-1">{job.salary}</p>}
                    {email && (
                      <p className="text-sm text-blue-400 mt-2 flex items-center gap-1">
                        <Mail size={14} />
                        {email.email}
                        <span className="text-gray-600">({email.confidence}% conf)</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[job.status] || STATUS_COLORS.scraped}`}>
                      {job.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-600">{job.source}</span>
                    <a href={job.job_url} target="_blank" rel="noreferrer" data-testid={`job-link-${job.id}`} className="text-emerald-400 hover:text-emerald-300">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        <button
          data-testid="btn-prev-page"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
        <button
          data-testid="btn-next-page"
          disabled={jobs.length < 20}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
