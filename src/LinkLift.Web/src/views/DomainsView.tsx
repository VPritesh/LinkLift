import React, { useState } from 'react';
import { Globe, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { DomainMapping, CreateDomainRequest } from '../types';

interface DomainsViewProps {
  domains: DomainMapping[];
  onAddDomain: (request: CreateDomainRequest) => Promise<void>;
  onDeleteDomain: (id: number) => Promise<void>;
}

export const DomainsView: React.FC<DomainsViewProps> = ({
  domains,
  onAddDomain,
  onDeleteDomain
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [hostname, setHostname] = useState('');
  const [customNotFoundUrl, setCustomNotFoundUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onAddDomain({
        hostname: hostname.trim().toLowerCase(),
        customNotFoundUrl: customNotFoundUrl.trim() || null,
        description: description.trim() || null
      });
      setHostname('');
      setCustomNotFoundUrl('');
      setDescription('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-[#377495]" />
            <span>Multi-Domain & Host Orchestration</span>
          </h2>
          <p className="text-xs text-slate-500">
            Host branded shortlinks across custom apex or subdomains with sub-millisecond Redis edge resolution.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Domain</span>
        </button>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {domains.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Globe className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Custom Domains Configured</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All shortlinks are currently served through the default host / apex. Add domains like <code>go.brand.com</code> to white-label your links.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-[#377495] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow"
            >
              Add Your First Domain
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-6">Domain Hostname</th>
                  <th className="py-3.5 px-6">Custom 404 Destination</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Mapped Links</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {domains.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#377495] font-mono">
                          {d.hostname}
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3 text-purple-600" /> Edge Cached
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-600 truncate max-w-xs">
                      {d.customNotFoundUrl ? (
                        <a href={d.customNotFoundUrl} target="_blank" rel="noreferrer" className="text-[#377495] hover:underline flex items-center gap-1">
                          <span className="truncate">{d.customNotFoundUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Default Platform 404</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {d.linkCount}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove custom domain '${d.hostname}'?`)) {
                            onDeleteDomain(d.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Domain"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Add Custom Domain</h3>
              <p className="text-xs text-slate-500 mb-4">
                Bind an apex domain or subdomain (e.g. <code>links.mycompany.com</code>).
              </p>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hostname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="go.yourbrand.io"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Custom 404 / Fallback URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourbrand.io/404"
                    value={customNotFoundUrl}
                    onChange={(e) => setCustomNotFoundUrl(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Where visitors go if an unmapped slug is accessed under this hostname.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Description / Internal Label
                  </label>
                  <input
                    type="text"
                    placeholder="EU Marketing Landing Domain"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold rounded-lg shadow disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Domain'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

