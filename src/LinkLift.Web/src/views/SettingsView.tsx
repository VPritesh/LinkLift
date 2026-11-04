import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Server,
  Zap,
  Info,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ClientSettings } from '../types';
import { serverConfigService } from '../services/serverConfig';

interface SettingsViewProps {
  onNavigateToServers: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateToServers }) => {
  const [settings, setSettings] = useState<ClientSettings>(serverConfigService.getSettings());
  const [activeTab, setActiveTab] = useState<'defaults' | 'realtime' | 'backup' | 'about'>('defaults');
  const [savedNotice, setSavedNotice] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeServer = serverConfigService.getActiveServer();

  const handleUpdate = (updates: Partial<ClientSettings>) => {
    const next = serverConfigService.updateSettings(updates);
    setSettings(next);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJson = () => {
    const json = serverConfigService.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linklift-client-backup-${Date.now()}.json`;
    a.click();
    setBackupNotice({ type: 'success', text: 'Settings & server configuration exported successfully!' });
    setTimeout(() => setBackupNotice(null), 3500);
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
          setSettings(serverConfigService.getSettings());
          setBackupNotice({ type: 'success', text: 'Backup restored successfully! Please refresh if switching servers.' });
        } else {
          setBackupNotice({ type: 'error', text: 'Failed to restore configuration. Invalid JSON structure.' });
        }
        setTimeout(() => setBackupNotice(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#377495]/10 text-[#377495]">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Application Settings & Preferences</h2>
            <p className="text-xs text-slate-500">
              Customize URL shortening defaults, real-time telemetry behavior, pagination, and data backups.
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 bg-white px-6 rounded-t-xl">
        {[
          { id: 'defaults', label: 'Shortener Defaults', icon: Sliders },
          { id: 'realtime', label: 'Telemetry & UI', icon: Activity },
          { id: 'backup', label: 'Backup & Restore', icon: Download },
          { id: 'about', label: 'About & Node Info', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition ${
                isActive
                  ? 'border-[#377495] text-[#377495]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Shortener Defaults */}
      {activeTab === 'defaults' && (
        <div className="bg-white rounded-b-xl p-6 border border-slate-200 border-t-0 shadow-sm space-y-6">
          {/* Active Server Context Pill */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#377495] text-white">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Target Server: {activeServer.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {activeServer.url}
                </div>
              </div>
            </div>
            <button
              onClick={onNavigateToServers}
              className="text-xs text-[#377495] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Server Fleet</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Redirect Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Default HTTP Redirect Type
              </label>
              <p className="text-[11px] text-slate-500">
                Choose the default HTTP status code used when visitors access short links.
              </p>
              <select
                value={settings.defaultRedirectType}
                onChange={(e) => handleUpdate({ defaultRedirectType: parseInt(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
              >
                <option value={302}>302 Found (Recommended: Enables real-time rule evaluation & analytics)</option>
                <option value={301}>301 Moved Permanently (Cached aggressively by client browsers)</option>
                <option value={307}>307 Temporary Redirect (Strict method preservation)</option>
              </select>
            </div>

            {/* Default Link Expiration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Default Link Expiration Policy
              </label>
              <p className="text-[11px] text-slate-500">
                Automatically set an expiration date when creating new links.
              </p>
              <select
                value={settings.defaultExpirationDays === null ? 'none' : settings.defaultExpirationDays}
                onChange={(e) => {
                  const val = e.target.value === 'none' ? null : parseInt(e.target.value);
                  handleUpdate({ defaultExpirationDays: val });
                }}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
              >
                <option value="none">No Expiration (Indefinite Lifespan)</option>
                <option value="7">Expire after 7 Days</option>
                <option value="30">Expire after 30 Days</option>
                <option value="90">Expire after 90 Days</option>
                <option value="365">Expire after 1 Year</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Telemetry & UI */}
      {activeTab === 'realtime' && (
        <div className="bg-white rounded-b-xl p-6 border border-slate-200 border-t-0 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Table Pagination */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Links Per Page (Directory View)
              </label>
              <p className="text-[11px] text-slate-500">
                Number of short links displayed per page in the link list.
              </p>
              <select
                value={settings.linksPerPage}
                onChange={(e) => handleUpdate({ linksPerPage: parseInt(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
              >
                <option value={10}>10 Links per page</option>
                <option value={25}>25 Links per page (Default)</option>
                <option value={50}>50 Links per page</option>
                <option value={100}>100 Links per page (High Density)</option>
              </select>
            </div>

            {/* Radar Buffer Size */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Real-Time Radar Event Buffer
              </label>
              <p className="text-[11px] text-slate-500">
                Maximum live click events retained in memory on the real-time telemetry screen.
              </p>
              <select
                value={settings.telemetryBufferLimit}
                onChange={(e) => handleUpdate({ telemetryBufferLimit: parseInt(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
              >
                <option value={50}>50 Events</option>
                <option value={100}>100 Events (Recommended)</option>
                <option value={250}>250 Events</option>
                <option value={500}>500 Events</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-b-xl p-6 border border-slate-200 border-t-0 shadow-sm space-y-6">
          {backupNotice && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold shadow-sm border ${
              backupNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {backupNotice.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{backupNotice.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Download className="h-4 w-4 text-[#377495]" />
                <span>Export Configuration Backup</span>
              </div>
              <p className="text-xs text-slate-600">
                Download a complete JSON export of all your configured servers, API keys, and client preferences to easily migrate to another browser or machine.
              </p>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-4 py-2 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download JSON Backup</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Upload className="h-4 w-4 text-[#377495]" />
                <span>Restore from JSON Backup</span>
              </div>
              <p className="text-xs text-slate-600">
                Select a previously exported LinkLift JSON backup file to instantly restore your server cluster and preferences.
              </p>
              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow transition">
                <Upload className="h-3.5 w-3.5" />
                <span>Select Backup File (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: About & System Info */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-b-xl p-6 border border-slate-200 border-t-0 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#377495] to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">LinkLift Enterprise URL Management</h3>
              <p className="text-xs text-slate-500">Enterprise High-Throughput Redirection Platform</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Architecture</span>
              <span className="font-mono text-slate-800">Clean Architecture / SOLID (.NET 10 Minimal APIs)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Caching Layer</span>
              <span className="font-mono text-slate-800">Hybrid L1 MemoryCache + L2 Redis Pub/Sub</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Telemetry Pipeline</span>
              <span className="font-mono text-slate-800">System.Threading.Channels Non-blocking Batch Writer</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Web Client Version</span>
              <span className="font-mono text-slate-800">v1.2.0 (React 19, Vite 8, Tailwind CSS)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

