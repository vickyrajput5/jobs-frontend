import { useEffect, useState } from 'react';
import { Briefcase, Building2, Mail, AtSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';
import { COUNTRY_NAMES } from '../components/ui';

const COLORS = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c'];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const countryData = Object.entries(stats?.byCountry || {}).map(([code, count]) => ({
    name: COUNTRY_NAMES[code] || code,
    count,
  }));

  const statusData = Object.entries(stats?.byStatus || {}).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
  }));

  if (loading) {
    return <div className="text-gray-500" data-testid="dashboard-loading">Loading...</div>;
  }

  return (
    <div data-testid="dashboard-page">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Total Jobs" value={stats?.totalJobs} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={AtSign} label="Emails Found" value={stats?.totalEmails} color="bg-pink-500/10 text-pink-400" />
        <StatCard icon={Mail} label="Campaigns" value={stats?.totalCampaigns} color="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="chart-country">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Jobs by Country</h3>
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countryData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm">No data yet. Run the scraper first.</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="chart-status">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Job Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
