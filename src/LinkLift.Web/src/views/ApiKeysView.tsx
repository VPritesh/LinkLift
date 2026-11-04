import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, CheckCircle2, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { api } from '../services/api';
import { ApiKey, CreateApiKeyRequest } from '../types';

export const ApiKeysView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [canCreate, setCanCreate] = useState(true);
  const [canRead, setCanRead] = useState(true);
  const [canAdmin, setCanAdmin] = useState(false);

  // One-time newly generated key modal
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await api.getApiKeys();
      setKeys(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const scopes: string[] = [];
    if (canCreate) scopes.push('links:create');
    if (canRead) scopes.push('analytics:read');
    if (canAdmin) scopes.push('admin:write');

    try {
      const created = await api.createApiKey({
        name: name.trim(),
        scopes: scopes.join(',') || 'links:create'
      });

      setShowCreateModal(false);
      setName('');
      setCanCreate(true);
      setCanRead(true);
      setCanAdmin(false);

      if (created.plainTextKey) {
        setRevealedKey(created.plainTextKey);
      }
      loadKeys();
    } catch (err: any) {
      alert(`Failed to create API key: ${err.message}`);
    }
  };

  const handleRevoke = async (id: number, keyName: string) => {
    if (confirm(`Revoke API key '${keyName}'? Any services using this key will immediately receive HTTP 401.`)) {
      try {
        await api.revokeApiKey(id);
        loadKeys();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCopyRevealedKey = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Key className="h-5 w-5 text-[#377495]" />
            <span>API Keys & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Generate and manage cryptographically hashed API keys for programmatic automation and headless integrations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow flex items-center space-x-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Key className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Custom API Keys</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Default developer master key is active. Generate granular scoped keys for external services.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <th className="py-3.5 px-6">Key Label & Prefix</th>
                  <th className="py-3.5 px-6">Granted Scopes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6">Last Used</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block">{k.name}</span>
                      <code className="text-[11px] font-mono text-[#377495] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {k.keyPrefix}••••••••
                      </code>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.split(',').map((scope) => (
                          <span
                            key={scope}
                            className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200"
                          >
                            {scope.trim()}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {k.isActive ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                          Revoked
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-[11px]">
                      {k.lastUsedAtUtc ? new Date(k.lastUsedAtUtc).toLocaleString() : 'Never used'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {k.isActive && (
                        <button
                          onClick={() => handleRevoke(k.id, k.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Revoke Key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Generate New Key */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Generate API Key</h3>
              <p className="text-xs text-slate-500 mb-4">
                Keys authenticate via the <code>X-Api-Key</code> HTTP request header.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Key Name / Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CI/CD Deployment Runner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Granular RBAC Scopes
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 rounded hover:bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreate}
                      onChange={(e) => setCanCreate(e.target.checked)}
                      className="rounded text-[#377495] focus:ring-[#377495]"
                    />
                    <div>
                      <span className="font-semibold block">links:create</span>
                      <span className="text-[11px] text-slate-400">Allows shortening links and bulk imports</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 rounded hover:bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canRead}
                      onChange={(e) => setCanRead(e.target.checked)}
                      className="rounded text-[#377495] focus:ring-[#377495]"
                    />
                    <div>
                      <span className="font-semibold block">analytics:read</span>
                      <span className="text-[11px] text-slate-400">Allows querying telemetry stats and summaries</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 rounded hover:bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canAdmin}
                      onChange={(e) => setCanAdmin(e.target.checked)}
                      className="rounded text-[#377495] focus:ring-[#377495]"
                    />
                    <div>
                      <span className="font-semibold block">admin:write</span>
                      <span className="text-[11px] text-slate-400">Full privileges: delete links, manage domains and keys</span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold rounded-lg shadow"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reveal One-Time Plaintext Key */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-2 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-base font-bold text-slate-900">Copy Your API Key Now</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                This secret token will <strong>never be shown again</strong>. Please copy and store it securely in your secret manager or environment variables.
              </p>

              <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl flex items-center justify-between mb-4 shadow-inner">
                <span className="truncate mr-2 select-all">{revealedKey}</span>
                <button
                  onClick={handleCopyRevealedKey}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-sans font-bold text-xs rounded-lg flex items-center space-x-1 shadow shrink-0"
                >
                  {copiedKey ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-900" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setRevealedKey(null)}
                  className="px-5 py-2 bg-[#377495] text-white text-xs font-semibold rounded-lg shadow"
                >
                  I have saved this key safely
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

