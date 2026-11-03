import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Upload, 
  Radio, 
  Zap,
  Globe,
  Key,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { ServerConfig } from '../types';
import { serverConfigService } from '../services/serverConfig';
import { api } from '../services/api';

interface ManageServersViewProps {
  onServerSwitched: (newServer: ServerConfig) => void;
}

export const ManageServersView: React.FC<ManageServersViewProps> = ({ onServerSwitched }) => {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [activeServer, setActiveServer] = useState<ServerConfig>(serverConfigService.getActiveServer());
  const [isAdding, setIsAdding] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);

  // Add/Edit form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);

  // Testing status state
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; result?: { success: boolean; latencyMs: number; message: string } }>>({});
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshServers = () => {
    const list = serverConfigService.getServers();
    setServers(list);
    setActiveServer(serverConfigService.getActiveServer());
  };

  useEffect(() => {
    refreshServers();
  }, []);

  const handleTestConnection = async (serverId: string, url: string, key: string) => {
    setTestStatus(prev => ({ ...prev, [serverId]: { loading: true } }));
    const result = await api.testConnection(url, key);
    setTestStatus(prev => ({ ...prev, [serverId]: { loading: false, result } }));
  };

  const handleSwitchServer = (server: ServerConfig) => {
    serverConfigService.setActiveServer(server.id);
    setActiveServer(server);
    onServerSwitched(server);
    setGlobalMessage({ type: 'success', text: `Switched active server to "${server.name}" (${server.url})` });
    setTimeout(() => setGlobalMessage(null), 4000);
  };

  const handleDeleteServer = (id: string, name: string) => {
    if (servers.length <= 1) {
      alert('You cannot delete the only remaining server configuration.');
      return;
    }
    if (confirm(`Are you sure you want to remove the server configuration "${name}"?`)) {
      try {
        serverConfigService.deleteServer(id);
        refreshServers();
        const newActive = serverConfigService.getActiveServer();
        onServerSwitched(newActive);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveNewServer = async () => {
    if (!formName.trim() || !formUrl.trim() || !formApiKey.trim()) {
      alert('Please fill in Server Name, Base URL, and API Key.');
      return;
    }

    // Auto-test before adding
    const check = await api.testConnection(formUrl, formApiKey);
    if (!check.success) {
      const proceed = confirm(`Connection test failed: "${check.message}". Do you still want to add this server anyway?`);
      if (!proceed) return;
    }

    const created = serverConfigService.addServer({
      name: formName.trim(),
      url: formUrl.trim().replace(/\/+$/, ''),
      apiKey: formApiKey.trim(),
      isDefault: formIsDefault
    });

    if (formIsDefault) {
      serverConfigService.setActiveServer(created.id);
      onServerSwitched(created);
    }

    setIsAdding(false);
    setFormName('');
    setFormUrl('');
    setFormApiKey('');
    setFormIsDefault(false);
    refreshServers();

    setGlobalMessage({ type: 'success', text: `Server "${created.name}" configured successfully!` });
    setTimeout(() => setGlobalMessage(null), 4000);
  };

  const handleExportJson = () => {
    const json = serverConfigService.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linklift-servers-config-${Date.now()}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = serverConfigService.importConfig(text);
        if (ok) {
          refreshServers();
          const active = serverConfigService.getActiveServer();
          onServerSwitched(active);
          setGlobalMessage({ type: 'success', text: 'Server configurations imported successfully!' });
        } else {
          setGlobalMessage({ type: 'error', text: 'Failed to import servers. Invalid JSON schema.' });
        }
        setTimeout(() => setGlobalMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Notifications */}
      {globalMessage && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold shadow-sm border ${
          globalMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {globalMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{globalMessage.text}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#035392]/10 text-[#035392]">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Server Fleet & Multi-Node Cluster</h2>
            <p className="text-xs text-slate-500">
              Manage multiple self-hosted LinkLift instances, switch between local, staging, and production servers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export & Import */}
          <button
            onClick={handleExportJson}
            title="Export Server Config as JSON"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition border border-slate-200 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Config</span>
          </button>

          <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition border border-slate-200 shadow-sm">
            <Upload className="h-3.5 w-3.5 text-slate-600" />
            <span>Import</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJson} 
              className="hidden" 
            />
          </label>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-md shadow-[#035392]/20 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Server</span>
          </button>
        </div>
      </div>

      {/* Add Server Inline Modal / Panel */}
      {isAdding && (
        <div className="bg-white rounded-xl border-2 border-[#035392]/30 p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#035392]" />
              Add New LinkLift Server Connection
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Server Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. EU Production Cluster"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035392]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Server Base URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://linklift.mycompany.com or http://localhost:5000"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#035392]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="ll_live_..."
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#035392]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={formIsDefault}
                onChange={(e) => setFormIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-[#035392] focus:ring-[#035392]"
              />
              <span>Set as default active server upon save</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleTestConnection('new-form', formUrl, formApiKey)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition border border-slate-200"
              >
                {testStatus['new-form']?.loading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={handleSaveNewServer}
                className="px-5 py-2 bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Save Server
              </button>
            </div>
          </div>

          {/* Test Status feedback for new form */}
          {testStatus['new-form']?.result && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 border ${
              testStatus['new-form'].result.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {testStatus['new-form'].result.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>{testStatus['new-form'].result.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Servers List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((server) => {
          const isActive = server.id === activeServer.id;
          const status = testStatus[server.id];

          return (
            <div 
              key={server.id}
              className={`bg-white rounded-xl border p-5 transition shadow-sm relative flex flex-col justify-between ${
                isActive 
                  ? 'border-[#035392] ring-2 ring-[#035392]/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-[#035392] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-800">{server.name}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected Active
                          </span>
                        )}
                        {server.isDefault && !isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        {server.url}
                      </p>
                    </div>
                  </div>

                  {/* Delete button (if not active or if multiple servers exist) */}
                  {servers.length > 1 && (
                    <button
                      onClick={() => handleDeleteServer(server.id, server.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Server"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* API Key Mask */}
                <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Key className="h-3.5 w-3.5 text-[#035392]" />
                    <span className="font-mono text-[11px]">
                      {server.apiKey.substring(0, 6)}••••••••••••••••
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Configured Key
                  </span>
                </div>

                {/* Test status report */}
                {status?.result && (
                  <div className={`mt-3 p-2 rounded-lg text-xs font-medium flex items-center space-x-2 border ${
                    status.result.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {status.result.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    )}
                    <span className="truncate">{status.result.message}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestConnection(server.id, server.url, server.apiKey)}
                  disabled={status?.loading}
                  className="text-xs font-semibold text-slate-600 hover:text-[#035392] flex items-center space-x-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${status?.loading ? 'animate-spin text-[#035392]' : ''}`} />
                  <span>Test Status</span>
                </button>

                {!isActive ? (
                  <button
                    onClick={() => handleSwitchServer(server)}
                    className="px-3 py-1.5 bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow transition"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Switch to this Server</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold italic">
                    Currently Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

