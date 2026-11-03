import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Check, 
  Plus, 
  ExternalLink, 
  Globe, 
  Key, 
  Radio, 
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServerConfig } from '../../types';
import { serverConfigService } from '../../services/serverConfig';
import { api } from '../../services/api';

interface ServerSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeServer: ServerConfig;
  onServerSelected: (server: ServerConfig) => void;
  onNavigateToManageServers: () => void;
}

export const ServerSwitcherModal: React.FC<ServerSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeServer,
  onServerSelected,
  onNavigateToManageServers
}) => {
  if (!isOpen) return null;

  const servers = serverConfigService.getServers();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs: number; message: string } | null>(null);

  const handleTest = async (server: ServerConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingId(server.id);
    const res = await api.testConnection(server.url, server.apiKey);
    setTestResult({ id: server.id, ...res });
    setTestingId(null);
  };

  const handleSelect = (server: ServerConfig) => {
    serverConfigService.setActiveServer(server.id);
    onServerSelected(server);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#035392]/10 text-[#035392]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Switch Active LinkLift Server</h3>
              <p className="text-[11px] text-slate-500">Select which cluster endpoint to manage and monitor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Server List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {servers.map((server) => {
            const isSelected = server.id === activeServer.id;
            const isTested = testResult?.id === server.id;

            return (
              <div
                key={server.id}
                onClick={() => handleSelect(server)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#035392] bg-[#035392]/5 ring-1 ring-[#035392]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{server.name}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                      {server.isDefault && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3 text-slate-400" />
                      <span>{server.url}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleTest(server, e)}
                      disabled={testingId === server.id}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#035392] bg-white border border-slate-200 rounded hover:bg-slate-100 transition flex items-center gap-1 shadow-sm"
                    >
                      <RefreshCw className={`h-3 w-3 ${testingId === server.id ? 'animate-spin text-[#035392]' : ''}`} />
                      <span>Ping</span>
                    </button>
                    {isSelected && <Check className="h-4 w-4 text-[#035392]" />}
                  </div>
                </div>

                {/* Inline test feedback */}
                {isTested && testResult && (
                  <div className={`mt-2.5 p-2 rounded text-[11px] font-medium flex items-center space-x-1.5 border ${
                    testResult.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{testResult.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateToManageServers();
            }}
            className="text-xs font-semibold text-[#035392] hover:underline flex items-center gap-1"
          >
            <span>Manage All Servers & Nodes</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

