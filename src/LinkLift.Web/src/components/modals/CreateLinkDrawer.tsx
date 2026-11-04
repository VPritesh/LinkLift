import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  Settings2, 
  Compass, 
  Plus, 
  Trash2, 
  Globe, 
  Smartphone, 
  Monitor, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { CreateShortLinkRequest, DomainMapping, ShortLinkRule } from '../../types';

interface CreateLinkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShortLinkRequest) => Promise<void>;
  domains: DomainMapping[];
}

export const CreateLinkDrawer: React.FC<CreateLinkDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  domains
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'rules' | 'expiration'>('basics');
  
  // Basics Form
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [domainHostname, setDomainHostname] = useState('');

  // Expiration & Redirection
  const [redirectType, setRedirectType] = useState<number>(302);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<string>('');

  // Dynamic Rules
  const [rules, setRules] = useState<ShortLinkRule[]>([]);
  const [newRuleType, setNewRuleType] = useState<number>(1);
  const [newRuleMatch, setNewRuleMatch] = useState('');
  const [newRuleTarget, setNewRuleTarget] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newRuleMatch.trim() || !newRuleTarget.trim()) {
      alert('Please provide both a match condition and a target URL.');
      return;
    }

    setRules([
      ...rules,
      {
        ruleType: newRuleType,
        matchValue: newRuleMatch.trim(),
        targetUrl: newRuleTarget.trim(),
        priority: rules.length
      }
    ]);

    setNewRuleMatch('');
    setNewRuleTarget('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!originalUrl.trim()) {
      setError('Destination URL is required.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateShortLinkRequest = {
        originalUrl: originalUrl.trim(),
        customSlug: customSlug.trim() || null,
        title: title.trim() || null,
        description: description.trim() || null,
        redirectType,
        domainHostname: domainHostname || null,
        expiresAtUtc: expiresAt ? new Date(expiresAt).toISOString() : null,
        maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
        rules: rules.length > 0 ? rules : undefined
      };

      await onSubmit(payload);
      // Reset form
      setOriginalUrl('');
      setCustomSlug('');
      setTitle('');
      setDescription('');
      setTagsInput('');
      setDomainHostname('');
      setRedirectType(302);
      setExpiresAt('');
      setMaxClicks('');
      setRules([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create shortlink');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-[#0e1d25] text-white flex items-center justify-between border-b border-[#1c3a4a]">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-[#377495] flex items-center justify-center text-cyan-300">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">Create Shortlink</h2>
                <p className="text-xs text-slate-300">Generate high-performance, dynamic redirection</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subheader Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6">
            <button
              onClick={() => setActiveTab('basics')}
              className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'basics' 
                  ? 'border-[#377495] text-[#377495]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>General Details</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'rules' 
                  ? 'border-[#377495] text-[#377495]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Dynamic Routing ({rules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('expiration')}
              className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'expiration' 
                  ? 'border-[#377495] text-[#377495]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Redirect & Expiry</span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: BASICS */}
              {activeTab === 'basics' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Destination URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://yourbrand.com/products/summer-sale?utm_source=twitter"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Domain Binding
                      </label>
                      <select
                        value={domainHostname}
                        onChange={(e) => setDomainHostname(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                      >
                        <option value="">Default Host / Apex</option>
                        {domains.map(d => (
                          <option key={d.id} value={d.hostname}>
                            {d.hostname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Custom Keyword / Slug
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. launch or 🚀"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Leave blank for auto-generated Base62 string (e.g. <code>4c92</code>). Emojis supported!
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Link Title
                    </label>
                    <input
                      type="text"
                      placeholder="Q4 Product Launch Campaign"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Campaign Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="social, promo, black-friday"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Description / Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Internal tracking notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC ROUTING RULES */}
              {activeTab === 'rules' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Compass className="h-4 w-4 text-[#377495]" />
                      <span>Dynamic Edge Redirection</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Redirect users to localized or device-optimized target URLs based on their origin country, device type, or OS.
                    </p>
                  </div>

                  {/* Add Rule Box */}
                  <div className="p-3.5 bg-cyan-50/50 border border-cyan-200 rounded-lg space-y-3">
                    <span className="text-xs font-bold text-cyan-900 block">Add New Dynamic Rule</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Condition</label>
                        <select
                          value={newRuleType}
                          onChange={(e) => setNewRuleType(parseInt(e.target.value, 10))}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white"
                        >
                          <option value={1}>Country (ISO)</option>
                          <option value={2}>Device Type</option>
                          <option value={3}>Operating System</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">
                          {newRuleType === 1 ? 'Country (e.g. US, GB)' : newRuleType === 2 ? 'Mobile/Desktop' : 'iOS/Android'}
                        </label>
                        <input
                          type="text"
                          placeholder={newRuleType === 1 ? 'e.g. GB or CA' : newRuleType === 2 ? 'Mobile or Desktop' : 'iOS or Windows'}
                          value={newRuleMatch}
                          onChange={(e) => setNewRuleMatch(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Target Destination</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={newRuleTarget}
                          onChange={(e) => setNewRuleTarget(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRule}
                      className="w-full py-1.5 bg-[#377495] hover:bg-[#295770] text-white text-xs font-medium rounded-md flex items-center justify-center space-x-1 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  {/* Configured Rules List */}
                  {rules.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No dynamic rules configured. All visitors will route to the default destination.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Active Rules ({rules.length})</label>
                      {rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {rule.ruleType === 1 ? 'Country' : rule.ruleType === 2 ? 'Device' : 'OS'}: {rule.matchValue}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-600 truncate max-w-[200px]" title={rule.targetUrl}>
                              {rule.targetUrl}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXPIRATION & PROTOCOL */}
              {activeTab === 'expiration' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      HTTP Redirection Protocol
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { code: 302, title: '302 Found', sub: 'Ensures 100% telemetry capture (Recommended)' },
                        { code: 301, title: '301 Permanent', sub: 'Aggressively cached by client browsers' },
                        { code: 307, title: '307 Temporary', sub: 'Preserves request method & payload' }
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setRedirectType(item.code)}
                          className={`p-3 rounded-lg border text-left transition ${
                            redirectType === item.code
                              ? 'border-[#377495] bg-[#377495]/5 ring-1 ring-[#377495]'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`block font-bold text-xs ${redirectType === item.code ? 'text-[#377495]' : 'text-slate-800'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                            {item.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Expiration Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Link will return HTTP 410 Gone after this timestamp.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Max Click Cap
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 500"
                        value={maxClicks}
                        onChange={(e) => setMaxClicks(e.target.value)}
                        className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495] bg-white text-slate-900"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Automatically disables after threshold clicks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-md shadow-[#377495]/20 flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Create Shortlink</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

