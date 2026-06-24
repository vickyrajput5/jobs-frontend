import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Mail, Search, Building2, Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Scraper from './pages/Scraper';
import ScrapeRunDetail from './pages/ScrapeRunDetail';
import Campaigns from './pages/Campaigns';
import { ScrapeStatusProvider, useScrapeStatusContext } from './context/ScrapeStatusContext';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/scraper', icon: Search, label: 'Scraper' },
  { to: '/campaigns', icon: Mail, label: 'Campaigns' },
];

function AppLayout() {
  const { running, activeRuns } = useScrapeStatusContext();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col" data-testid="sidebar">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold text-emerald-400">Gulf Jobs</h1>
          <p className="text-xs text-gray-500 mt-1">Scraper & Outreach</p>
        </div>
        {running && (
          <div className="mb-4 mx-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20" data-testid="sidebar-scrape-status">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Loader2 size={14} className="animate-spin" />
              Scraping ({activeRuns})
            </div>
          </div>
        )}
        <nav className="flex-1 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              data-testid={`nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`
              }
            >
              {label === 'Scraper' && running ? (
                <Loader2 size={18} className="animate-spin text-amber-400" />
              ) : (
                <Icon size={18} />
              )}
              {label}
              {label === 'Scraper' && running && (
                <span className="ml-auto text-xs text-amber-400">{activeRuns}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="text-xs text-gray-600 px-2">20 countries</div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {running && (
          <div
            className="bg-amber-500/15 border-b border-amber-500/30 px-8 py-2.5 flex items-center gap-3 shrink-0"
            data-testid="global-scrape-loading-bar"
          >
            <Loader2 size={16} className="animate-spin text-amber-400" />
            <p className="text-sm text-amber-300">
              Scraper running on server — {activeRuns} task{activeRuns !== 1 ? 's' : ''} in progress
            </p>
          </div>
        )}
        <main className="flex-1 p-8 overflow-auto" data-testid="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/scraper" element={<Scraper />} />
            <Route path="/scraper/runs/:id" element={<ScrapeRunDetail />} />
            <Route path="/campaigns" element={<Campaigns />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ScrapeStatusProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ScrapeStatusProvider>
  );
}
