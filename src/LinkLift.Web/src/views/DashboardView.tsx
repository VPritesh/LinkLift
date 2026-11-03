import React from 'react';
import { 
  Link2, 
  MousePointerClick, 
  ShieldAlert, 
  Globe, 
  Zap, 
  Plus, 
  Layers, 
  Activity, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  QrCode,
  CheckCircle2,
  TrendingUp,
  Laptop,
  Smartphone
} from 'lucide-react';
import { ShortLink, ClickEventNotification } from '../types';
import { NavItemKey } from '../components/layout/Sidebar';

interface DashboardViewProps {
  links: ShortLink[];
  liveClicks: ClickEventNotification[];
  onNavigate: (view: NavItemKey) => void;
  onOpenCreateDrawer: () => void;
  onOpenQRCode: (link: ShortLink) => void;
  domainsCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  links,
  liveClicks,
  onNavigate,
  onOpenCreateDrawer,
  onOpenQRCode,
  domainsCount
}) => {
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0);
  const botClicksCount = liveClicks.filter(c => c.isBot).length;
  const recentLinks = links.slice(0, 5);

  const handleCopy = (text: string, slug: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Welcome / Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#022c4f] via-[#035392] to-cyan-700 p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Link2 className="w-96 h-96 -mr-20 -mt-20 transform -rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-4 border border-white/10">
            <Zap className="h-3.5 w-3.5" />
            <span>Sub-5ms High Performance Redirection Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Link Orchestration Command Center
          </h1>
          <p className="text-sm text-slate-200 mb-6 leading-relaxed">
            Manage corporate domains, dynamic geo-routing, real-time telemetry streaming, and automated bot defenses across your entire URL portfolio.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenCreateDrawer}
              className="bg-white text-[#035392] hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Shortlink</span>
            </button>
            <button
              onClick={() => onNavigate('bulk')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-lg backdrop-blur-md transition flex items-center space-x-2 border border-white/20"
            >
              <Layers className="h-4 w-4" />
              <span>Bulk CSV Import</span>
            </button>
            <button
              onClick={() => onNavigate('live')}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-semibold px-4 py-2.5 rounded-lg backdrop-blur-md transition flex items-center space-x-2 border border-cyan-400/30"
            >
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>View Live Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Links */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Links</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#035392]">
              <Link2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{links.length}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Across all active domains & apex</p>
        </div>

        {/* Total Clicks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Redirections</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalClicks}</span>
            <span className="text-xs text-slate-500 font-medium">all-time clicks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Telemetry recorded in Redis & DB</p>
        </div>

        {/* Bot & Crawlers Filtered */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Bot Shield</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{botClicksCount}</span>
            <span className="text-xs text-amber-600 font-semibold">Flagged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Filtered via 3s rule & UA heuristics</p>
        </div>

        {/* Custom Domains */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Domains</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Globe className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{domainsCount}</span>
            <span className="text-xs text-purple-600 font-semibold">Configured</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Multi-tenant edge host routing</p>
        </div>
      </div>

      {/* Main Grid: Recent Links & Real-Time Radar Mini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Links Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Shortlinks</h3>
              <p className="text-xs text-slate-400">Newly provisioned URLs and performance</p>
            </div>
            <button
              onClick={() => onNavigate('links')}
              className="text-xs font-semibold text-[#035392] hover:underline flex items-center gap-1"
            >
              <span>View All Links</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentLinks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Link2 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No links created yet</p>
              <button
                onClick={onOpenCreateDrawer}
                className="mt-3 text-xs font-semibold text-[#035392] underline"
              >
                Create your first link
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {recentLinks.map((link) => (
                <div key={link.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#035392] text-sm hover:underline cursor-pointer">
                        /{link.slug}
                      </span>
                      {link.rules && link.rules.length > 0 && (
                        <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.2 rounded font-medium">
                          {link.rules.length} rule{link.rules.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {link.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5" title={link.originalUrl}>
                      {link.originalUrl}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{link.clickCount}</span>
                      <span className="block text-[10px] text-slate-400">clicks</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopy(link.shortUrl, link.slug)}
                        title="Copy Short URL"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        {copiedSlug === link.slug ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onOpenQRCode(link)}
                        title="View QR Code"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Test Link"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Telemetry Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-800">Live Telemetry</h3>
            </div>
            <button
              onClick={() => onNavigate('live')}
              className="text-xs font-semibold text-[#035392] hover:underline flex items-center gap-1"
            >
              <span>Full Radar</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1">
            {liveClicks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Activity className="h-8 w-8 mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Awaiting Click Telemetry</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  Clicks on any shortlink will stream here live via SignalR.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-hidden">
                {liveClicks.slice(0, 6).map((click, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-white shadow-sm text-[#035392]">
                        {click.deviceType === 2 ? (
                          <Smartphone className="h-3.5 w-3.5" />
                        ) : (
                          <Laptop className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">/{click.slug}</span>
                          {click.countryCode && (
                            <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1 rounded">
                              {click.countryCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {click.browser || 'Browser'} • {click.operatingSystem || 'OS'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(click.clickedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

