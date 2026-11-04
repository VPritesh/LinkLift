import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Zap, CheckCircle2, Play, AlertCircle } from 'lucide-react';

export const BotShieldView: React.FC = () => {
  const [testUa, setTestUa] = useState('curl/7.68.0');
  const [testIp, setTestIp] = useState('192.168.1.145');
  const [rapidSimulated, setRapidSimulated] = useState(false);
  const [evalResult, setEvalResult] = useState<{ isBot: boolean; reason: string | null } | null>(null);

  const botKeywords = [
    'bot', 'crawler', 'spider', 'curl', 'wget', 'python-requests', 
    'postman', 'googlebot', 'bingbot', 'slackbot', 'discordbot'
  ];

  const handleSimulate = () => {
    const ua = testUa.toLowerCase();
    for (const kw of botKeywords) {
      if (ua.includes(kw)) {
        setEvalResult({ isBot: true, reason: `Identified crawler keyword: '${kw}'` });
        return;
      }
    }

    if (rapidSimulated) {
      setEvalResult({ isBot: true, reason: 'Rapid consecutive click within 3 seconds' });
      return;
    }

    setEvalResult({ isBot: false, reason: 'Verified real human browser session' });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bot Shield & GDPR Compliance Engine</h2>
            <p className="text-xs text-slate-500">
              Heuristic traffic classification and zero-retention privacy anonymization built directly into the redirection layer.
            </p>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">3-Second Rapid Click Rule</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Detects bursts of requests to the same short slug from identical subnets under 3 seconds, screening out crawler scanners and preview bots.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#377495] flex items-center justify-center font-bold text-xs">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">User-Agent Blacklist</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Heuristic identification of web scrapers (curl, Python, Postman, Googlebot, Slackbot) ensuring your marketing metrics remain unpolluted.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">GDPR Masked IP Hashing</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Zero raw IP storage. Subnet octets are masked (e.g. <code>192.168.1.0</code>) before one-way SHA-256 cryptographic hashing.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Heuristic Simulator */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Interactive Heuristic Simulator</h3>
          <p className="text-xs text-slate-500">
            Test how LinkLift's redirection engine classifies different request signatures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Sample User-Agent
            </label>
            <input
              type="text"
              value={testUa}
              onChange={(e) => setTestUa(e.target.value)}
              className="w-full text-xs font-mono px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setTestUa('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5) Mobile/15E148 Safari/604.1')}
                className="text-[10px] text-slate-500 hover:text-[#377495] underline"
              >
                Set iPhone UA
              </button>
              <button
                type="button"
                onClick={() => setTestUa('curl/7.68.0')}
                className="text-[10px] text-slate-500 hover:text-[#377495] underline"
              >
                Set Curl UA
              </button>
              <button
                type="button"
                onClick={() => setTestUa('Googlebot/2.1 (+http://www.google.com/bot.html)')}
                className="text-[10px] text-slate-500 hover:text-[#377495] underline"
              >
                Set Googlebot
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Test IP Address
            </label>
            <input
              type="text"
              value={testIp}
              onChange={(e) => setTestIp(e.target.value)}
              className="w-full text-xs font-mono px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#377495]"
            />
            <label className="flex items-center space-x-2 mt-3 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rapidSimulated}
                onChange={(e) => setRapidSimulated(e.target.checked)}
                className="rounded text-[#377495]"
              />
              <span className="font-medium">Simulate consecutive click under 3 seconds</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSimulate}
            className="px-5 py-2 bg-[#377495] hover:bg-[#295770] text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Evaluate Signature</span>
          </button>

          {evalResult && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              evalResult.isBot ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {evalResult.isBot ? (
                <>
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Classified as Bot: {evalResult.reason}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Valid Human Visitor: {evalResult.reason}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

