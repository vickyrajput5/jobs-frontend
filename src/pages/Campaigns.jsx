import { useEffect, useState } from 'react';
import { Send, Plus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const DEFAULT_TEMPLATE = `<p>Dear {{company}} Team,</p>
<p>I am writing to express my interest in software engineering opportunities at your organization. With experience in full-stack development, I believe I could contribute meaningfully to your team.</p>
<p>I would welcome the opportunity to discuss how my skills align with your current openings, including the <strong>{{job_title}}</strong> position.</p>
<p>Please find my resume attached. I look forward to hearing from you.</p>
<p>Best regards</p>`;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: 'Software Engineer Application - {{company}}',
    body_html: DEFAULT_TEMPLATE,
  });
  const [sending, setSending] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [smtpOk, setSmtpOk] = useState(null);

  const load = () => {
    api.getCampaigns().then(setCampaigns).catch(console.error);
  };

  useEffect(() => {
    load();
    api.verifySmtp().then(() => setSmtpOk(true)).catch(() => setSmtpOk(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign(form);
      setShowForm(false);
      setForm({ name: '', subject: 'Software Engineer Application - {{company}}', body_html: DEFAULT_TEMPLATE });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Send emails to all companies with found emails? This is a one-time send.')) return;
    setSending(id);
    try {
      const result = await api.sendCampaign(id);
      alert(`Sent: ${result.sent}, Failed: ${result.failed}, Total: ${result.total}`);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(null);
    }
  };

  const viewLogs = async (id) => {
    setSelectedCampaign(id);
    const data = await api.getCampaignLogs(id);
    setLogs(data);
  };

  return (
    <div data-testid="campaigns-page">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
        <button
          data-testid="btn-new-campaign"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {smtpOk === false && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400" data-testid="smtp-warning">
          SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in backend .env
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 space-y-4" data-testid="campaign-form">
          <div>
            <label className="text-sm text-gray-400">Campaign Name</label>
            <input
              data-testid="input-campaign-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              placeholder="Gulf SWE Outreach Q1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Subject (use {'{{company}}'} for company name)</label>
            <input
              data-testid="input-campaign-subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email Body (HTML, use {'{{company}}'} and {'{{job_title}}'})</label>
            <textarea
              data-testid="input-campaign-body"
              value={form.body_html}
              onChange={(e) => setForm({ ...form, body_html: e.target.value })}
              required
              rows={10}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <button data-testid="btn-create-campaign" type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm">
            Create Campaign
          </button>
        </form>
      )}

      <div className="space-y-3 mb-8">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid={`campaign-card-${c.id}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.subject}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>Recipients: {c.total_recipients}</span>
                  <span>Sent: {c.sent_count}</span>
                  <span>Failed: {c.failed_count}</span>
                  <span className={`px-2 py-0.5 rounded ${
                    c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'sending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>{c.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid={`btn-view-logs-${c.id}`}
                  onClick={() => viewLogs(c.id)}
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs"
                >
                  Logs
                </button>
                {c.status === 'draft' && (
                  <button
                    data-testid={`btn-send-campaign-${c.id}`}
                    onClick={() => handleSend(c.id)}
                    disabled={sending === c.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs disabled:opacity-40"
                  >
                    {sending === c.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Once
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p className="text-gray-600 text-sm">No campaigns yet.</p>}
      </div>

      {selectedCampaign && logs.length > 0 && (
        <div data-testid="campaign-logs">
          <h3 className="text-lg font-semibold mb-3">Send Logs</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
                <span>{log.recipient_email}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  log.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
