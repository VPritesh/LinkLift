import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DEFAULT_API_KEY } from '../../services/api';
import { serverConfigService } from '../../services/serverConfig';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const activeServer = serverConfigService.getActiveServer();
  const [apiKey, setApiKey] = useState(activeServer.apiKey || DEFAULT_API_KEY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(serverConfigService.getActiveServer().apiKey || DEFAULT_API_KEY);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    localStorage.setItem('linklift_api_key', cleanKey);
    serverConfigService.updateServer(activeServer.id, { apiKey: cleanKey });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onKeySaved();
      onClose();
    }, 800);
  };

  const handleResetMaster = () => {
    setApiKey(DEFAULT_API_KEY);
    localStorage.setItem('linklift_api_key', DEFAULT_API_KEY);
    serverConfigService.updateServer(activeServer.id, { apiKey: DEFAULT_API_KEY });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-md p-6 border border-slate-200">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-[#035392]/10 text-[#035392]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">API Credentials</h3>
              <p className="text-xs text-slate-500">
                Server: <span className="font-semibold text-slate-700">{activeServer.name}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Active API Token
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035392] bg-slate-50 text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Default developer master key has full admin permissions.</span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetMaster}
                className="text-xs text-slate-500 hover:text-[#035392] underline font-medium"
              >
                Reset to Default
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
