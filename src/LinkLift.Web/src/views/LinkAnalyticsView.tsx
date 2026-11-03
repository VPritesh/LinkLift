import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Globe2, 
  Smartphone, 
  Laptop, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Users, 
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ShortLink, LinkAnalyticsSummary } from '../types';

interface LinkAnalyticsViewProps {
  links: ShortLink[];
  initialSlug?: string | null;
}

export const LinkAnalyticsView: React.FC<LinkAnalyticsViewProps> = ({
  links,
  initialSlug
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug || (links[0]?.slug ?? '')
  );
  const [analytics, setAnalytics] = useState<LinkAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  useEffect(() => {
    if (selectedSlug) {
      loadAnalytics(selectedSlug);
    }
  }, [selectedSlug]);

  const loadAnalytics = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnalyticsBySlug(slug);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'No telemetry captured yet for this link.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const currentLink = links.find(l => l.slug.toLowerCase() === selectedSlug.toLowerCase());

  return (
    <div className="space-y-6 w-full">
      {/* Top Selector Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-[#035392]" />
            <span>Link Telemetry Inspection</span>
          </h2>
          <p className="text-xs text-slate-500">
            Deep dive into geographic attribution, device hardware, and bot filtering for individual shortlinks.
          </p>
        </div>

        {/* Link Select */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-[#035392] focus:outline-none focus:ring-2 focus:ring-[#035392]"
          >
            {links.map(l => (
              <option key={l.id} value={l.slug}>
                /{l.slug} ({l.title || l.originalUrl.slice(0, 30)})
              </option>
            ))}
          </select>

          <button
            onClick={() => loadAnalytics(selectedSlug)}
            disabled={loading || !selectedSlug}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#035392]' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#035392]" />
          <p className="text-xs font-semibold">Aggregating telemetry from database...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No Analytics Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            This shortlink hasn't received any clicks yet. Click or share 
            <span className="font-mono text-[#035392] font-semibold"> /{selectedSlug} </span> 
            to start gathering metrics.
          </p>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Visits</span>
              <span className="text-2xl font-black text-slate-900">{analytics.totalClicks}</span>
              <span className="text-xs text-slate-400 block mt-1">all click events</span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Human Traffic</span>
              <span className="text-2xl font-black text-emerald-600">{analytics.realClicks}</span>
              <span className="text-xs text-slate-400 block mt-1">verified user redirects</span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Bots Screened</span>
              <span className="text-2xl font-black text-amber-600">{analytics.botClicks}</span>
              <span className="text-xs text-slate-400 block mt-1">prevented from metrics bias</span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Human Ratio</span>
              <span className="text-2xl font-black text-[#035392]">
                {analytics.totalClicks > 0 
                  ? Math.round((analytics.realClicks / analytics.totalClicks) * 100) 
                  : 100}%
              </span>
              <span className="text-xs text-slate-400 block mt-1">traffic authenticity</span>
            </div>
          </div>

          {/* Breakdown Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Countries Breakdown */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-[#035392]" />
                <span>Geographic Origin</span>
              </h4>
              <div className="space-y-3">
                {Object.keys(analytics.clicksByCountry).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No country data recorded</p>
                ) : (
                  Object.entries(analytics.clicksByCountry).map(([country, count]) => {
                    const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
                    return (
                      <div key={country} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="font-mono text-slate-800">{country}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#035392] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Devices Breakdown */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-[#035392]" />
                <span>Device Platform</span>
              </h4>
              <div className="space-y-3">
                {Object.keys(analytics.clicksByDevice).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No device data</p>
                ) : (
                  Object.entries(analytics.clicksByDevice).map(([device, count]) => {
                    const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
                    return (
                      <div key={device} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{device}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Operating Systems Breakdown */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Laptop className="h-4 w-4 text-[#035392]" />
                <span>Operating System</span>
              </h4>
              <div className="space-y-3">
                {Object.keys(analytics.clicksByOs).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No OS data</p>
                ) : (
                  Object.entries(analytics.clicksByOs).map(([os, count]) => {
                    const pct = Math.round((count / (analytics.totalClicks || 1)) * 100);
                    return (
                      <div key={os} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{os}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

