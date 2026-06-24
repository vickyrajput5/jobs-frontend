import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mail, Loader2, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { COUNTRY_NAMES } from '../components/ui';
import { useScrapeStatusContext } from '../context/ScrapeStatusContext';

const SOURCES = ['indeed', 'bayt', 'naukrigulf', 'jsearch', 'linkedin'];

export default function Scraper() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSources, setSelectedSources] = useState(['indeed', 'bayt', 'naukrigulf', 'jsearch']);
  const [findEmails, setFindEmails] = useState(true);
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState(null);
  const [findingEmails, setFindingEmails] = useState(false);
  const { running, activeRuns, lastResult, refresh: refreshStatus } = useScrapeStatusContext();

  const loadRuns = () => {
    api.getScrapeRuns().then(setRuns).catch(console.error);
  };

  useEffect(() => {
    api.getCountries().then((list) => {
      setCountries(list);
      setSelectedCountries(list.map((c) => c.code));
    }).catch(console.error);
  }, []);

  useEffect(loadRuns, []);

  useEffect(() => {
    loadRuns();
    if (running) {
      const id = setInterval(loadRuns, 3000);
      return () => clearInterval(id);
    }
  }, [running, activeRuns]);

  useEffect(() => {
    if (!running && lastResult) {
      setResult(lastResult);
      loadRuns();
    }
  }, [running, lastResult]);

  const toggleCountry = (code) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleSource = (src) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const handleScrape = async () => {
    setStarting(true);
    setResult(null);
    try {
      await api.startScrape({
        sources: selectedSources,
        countries: selectedCountries,
        findEmails,
      });
      await refreshStatus();
      loadRuns();
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setStarting(false);
    }
  };

  const handleFindEmails = async () => {
    setFindingEmails(true);
    try {
      const res = await api.findEmails(50);
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setFindingEmails(false);
    }
  };

  const isBusy = running || starting;

  return (
    <div data-testid="scraper-page">
      <h2 className="text-2xl font-bold mb-6">Scraper Control</h2>

      {running && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3" data-testid="scrape-running-banner">
          <Loader2 size={18} className="animate-spin text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">Scraping in background…</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeRuns} active run{activeRuns !== 1 ? 's' : ''} — safe to switch pages
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Countries</h3>
          <div className="flex flex-wrap gap-2">
            {countries.map(({ code, name }) => (
              <button
                key={code}
                data-testid={`country-toggle-${code}`}
                onClick={() => toggleCountry(code)}
                disabled={isBusy}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
                  selectedCountries.includes(code)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Sources</h3>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((src) => (
              <button
                key={src}
                data-testid={`source-toggle-${src}`}
                onClick={() => toggleSource(src)}
                disabled={isBusy}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 ${
                  selectedSources.includes(src)
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm" data-testid="find-emails-toggle">
          <input
            type="checkbox"
            checked={findEmails}
            onChange={(e) => setFindEmails(e.target.checked)}
            disabled={isBusy}
            className="rounded border-gray-600"
          />
          Auto-find company emails during scrape
        </label>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          data-testid="btn-start-scrape"
          onClick={handleScrape}
          disabled={isBusy || selectedCountries.length === 0 || selectedSources.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? 'Scraping…' : starting ? 'Starting…' : 'Start Scrape'}
        </button>
        <button
          data-testid="btn-find-emails"
          onClick={handleFindEmails}
          disabled={findingEmails || running}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {findingEmails ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          Find Emails (existing jobs)
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8" data-testid="scrape-result">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Result</h3>
          <pre className="text-sm text-gray-300 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-4">Recent Runs</h3>
      <div className="space-y-2">
        {runs.map((run) => (
          <button
            key={run.id}
            type="button"
            onClick={() => navigate(`/scraper/runs/${run.id}`)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between text-sm hover:border-emerald-500/40 hover:bg-gray-800/50 transition-colors cursor-pointer text-left"
            data-testid={`scrape-run-${run.id}`}
          >
            <div>
              <span className="font-medium capitalize">{run.source}</span>
              <span className="text-gray-500 mx-2">·</span>
              <span>{COUNTRY_NAMES[run.country] || run.country}</span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <span>{run.jobs_found} jobs</span>
              <span>{run.emails_found} emails</span>
              <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                run.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                run.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {run.status === 'running' && <Loader2 size={10} className="animate-spin" />}
                {run.status}
              </span>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          </button>
        ))}
        {runs.length === 0 && <p className="text-gray-600 text-sm">No scrape runs yet.</p>}
      </div>
    </div>
  );
}
