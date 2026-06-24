import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Mail, MapPin, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { COUNTRY_NAMES } from '../components/ui';

const STATUS_COLORS = {
  scraped: 'bg-gray-700 text-gray-300',
  email_found: 'bg-blue-500/20 text-blue-400',
  email_verified: 'bg-emerald-500/20 text-emerald-400',
  emailed: 'bg-purple-500/20 text-purple-400',
  failed: 'bg-red-500/20 text-red-400',
};

export default function ScrapeRunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setIndex(0);
    api.getScrapeRun(id)
      .then(({ run, jobs }) => {
        setRun(run);
        setJobs(jobs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const job = jobs[index];
  const email = job?.companies?.company_emails?.sort((a, b) => b.confidence - a.confidence)?.[0];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(jobs.length - 1, i + 1));

  const handleApply = () => {
    if (job?.job_url) window.open(job.job_url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <p className="text-gray-500" data-testid="scrape-run-loading">Loading...</p>;
  }

  if (!run) {
    return (
      <div data-testid="scrape-run-not-found">
        <p className="text-gray-500 mb-4">Scrape run not found.</p>
        <Link to="/scraper" className="text-emerald-400 text-sm">← Back to Scraper</Link>
      </div>
    );
  }

  return (
    <div data-testid="scrape-run-detail-page">
      <button
        data-testid="btn-back-scraper"
        onClick={() => navigate('/scraper')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-6"
      >
        <ArrowLeft size={16} /> Back to Scraper
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6" data-testid="scrape-run-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold capitalize">{run.source} · {COUNTRY_NAMES[run.country] || run.country}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(run.started_at).toLocaleString()}
              {run.completed_at && ` → ${new Date(run.completed_at).toLocaleString()}`}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">{run.jobs_found} jobs scraped</span>
            <span className="text-gray-400">{run.emails_found} emails found</span>
            <span className={`px-2 py-1 rounded text-xs ${
              run.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              run.status === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>{run.status}</span>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500" data-testid="no-jobs-found">
          No jobs found for this scrape run.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500" data-testid="job-counter">
              Job {index + 1} of {jobs.length}
            </span>
            <div className="flex gap-2">
              <button
                data-testid="btn-prev-job"
                onClick={goPrev}
                disabled={index === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                data-testid="btn-next-job"
                onClick={goNext}
                disabled={index === jobs.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6" data-testid={`scrape-run-job-${job.id}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Building2 size={14} />{job.company_name}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{job.location || COUNTRY_NAMES[job.country]}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[job.status] || STATUS_COLORS.scraped}`}>
                {job.status?.replace('_', ' ')}
              </span>
            </div>

            {job.salary && (
              <p className="text-emerald-400 text-sm mb-4">{job.salary}</p>
            )}

            {email && (
              <div className="flex items-center gap-2 text-sm text-blue-400 mb-4" data-testid="job-email">
                <Mail size={14} />
                {email.email}
                <span className="text-gray-600">({email.confidence}% confidence)</span>
              </div>
            )}

            {job.description && (
              <div className="text-sm text-gray-300 leading-relaxed mb-6 max-h-64 overflow-y-auto whitespace-pre-wrap border-t border-gray-800 pt-4">
                {job.description}
              </div>
            )}

            <div className="flex gap-3 border-t border-gray-800 pt-4">
              <button
                data-testid="btn-apply-job"
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
              >
                <ExternalLink size={16} /> Apply on {run.source}
              </button>
              {index < jobs.length - 1 && (
                <button
                  data-testid="btn-next-apply"
                  onClick={() => { handleApply(); goNext(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                >
                  Apply & Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2" data-testid="job-thumbnails">
            {jobs.map((j, i) => (
              <button
                key={j.id}
                data-testid={`job-thumb-${i}`}
                onClick={() => setIndex(i)}
                className={`text-left p-2 rounded-lg text-xs truncate border transition-colors ${
                  i === index
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700'
                }`}
                title={j.title}
              >
                {i + 1}. {j.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
