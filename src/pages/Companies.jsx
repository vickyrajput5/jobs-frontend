import { useEffect, useState } from 'react';
import { Globe, Mail, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { COUNTRY_NAMES } from '../components/ui';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCompanies()
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="companies-page">
      <h2 className="text-2xl font-bold mb-6">Companies ({companies.length})</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((co) => (
            <div key={co.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid={`company-card-${co.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{co.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{COUNTRY_NAMES[co.country] || co.country}</p>
                </div>
                {co.website && (
                  <a href={co.website} target="_blank" rel="noreferrer" data-testid={`company-website-${co.id}`} className="text-gray-500 hover:text-emerald-400">
                    <Globe size={16} />
                  </a>
                )}
              </div>

              <div className="mt-3 space-y-1">
                {(co.company_emails || []).map((em) => (
                  <div key={em.id} className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-blue-400" />
                    <span className="text-blue-300">{em.email}</span>
                    <span className="text-gray-600 text-xs">{em.confidence}% · {em.source}</span>
                    {em.mx_valid && <span className="text-emerald-500 text-xs">MX ✓</span>}
                  </div>
                ))}
                {(!co.company_emails || co.company_emails.length === 0) && (
                  <p className="text-sm text-gray-600">No emails found</p>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-3">{co.jobs?.[0]?.count || 0} jobs</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
