export const COUNTRY_NAMES = {
  SA: 'Saudi Arabia',
  AE: 'UAE',
  QA: 'Qatar',
  KW: 'Kuwait',
  OM: 'Oman',
  BH: 'Bahrain',
  PK: 'Pakistan',
  MY: 'Malaysia',
  AZ: 'Azerbaijan',
  TR: 'Turkey',
  ID: 'Indonesia',
  ES: 'Spain',
  AT: 'Austria',
  NL: 'Netherlands',
  BE: 'Belgium',
  MT: 'Malta',
  RO: 'Romania',
  LT: 'Lithuania',
  LV: 'Latvia',
  EG: 'Egypt',
};

export function StatCard({ label, value, icon: Icon, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-600/20 text-emerald-400',
    blue: 'bg-blue-600/20 text-blue-400',
    amber: 'bg-amber-600/20 text-amber-400',
    purple: 'bg-purple-600/20 text-purple-400',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-emerald-600/20 text-emerald-400',
    warning: 'bg-amber-600/20 text-amber-400',
    danger: 'bg-red-600/20 text-red-400',
    info: 'bg-blue-600/20 text-blue-400',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = 'primary', loading, ...props }) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

export function Select({ value, onChange, options, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export const STATUS_VARIANT = {
  scraped: 'default',
  email_found: 'info',
  email_verified: 'success',
  emailed: 'success',
  failed: 'danger',
};
