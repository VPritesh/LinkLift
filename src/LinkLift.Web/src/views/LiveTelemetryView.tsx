import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Globe2, 
  ExternalLink, 
  Filter, 
  Trash2, 
  Radio, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ClickEventNotification } from '../types';

interface LiveTelemetryViewProps {
  clicks: ClickEventNotification[];
  onClear: () => void;
  isConnected: boolean;
}

export const LiveTelemetryView: React.FC<LiveTelemetryViewProps> = ({
  clicks,
  onClear,
  isConnected
}) => {
  const [filterType, setFilterType] = useState<'all' | 'human' | 'bot'>('all');

  const filteredClicks = clicks.filter(c => {
    if (filterType === 'human') return !c.isBot;
    if (filterType === 'bot') return c.isBot;
    return true;
  });

  const botCount = clicks.filter(c => c.isBot).length;
  const humanCount = clicks.length - botCount;

  const getDeviceIcon = (type: number) => {
    switch (type) {
      case 2: return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case 3: return <Tablet className="h-4 w-4 text-purple-500" />;
      default: return <Laptop className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Telemetry Radar Status */}
      <div className="bg-[#022c4f] rounded-2xl p-6 text-white shadow-lg border border-[#033b66] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-[#035392] flex items-center justify-center text-cyan-300 shadow-md">
              <Activity className="h-6 w-6" />
            </div>
            {isConnected && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#022c4f]"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">SignalR Real-Time Telemetry Stream</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isConnected 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {isConnected ? 'Broadcasting Live' : 'Reconnecting...'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Powered by Redis Pub/Sub cluster backplane. New clicks appear instantaneously without page reload.
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-[#01233f] px-3 py-2 rounded-lg border border-[#033b66]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ingested</span>
            <span className="text-base font-black text-cyan-300">{clicks.length}</span>
          </div>
          <div className="bg-[#01233f] px-3 py-2 rounded-lg border border-[#033b66]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Real Visitors</span>
            <span className="text-base font-black text-emerald-400">{humanCount}</span>
          </div>
          <div className="bg-[#01233f] px-3 py-2 rounded-lg border border-[#033b66]">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Bots Shielded</span>
            <span className="text-base font-black text-amber-400">{botCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Traffic:</span>

          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All Events ({clicks.length})
            </button>
            <button
              onClick={() => setFilterType('human')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'human' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Real Users ({humanCount})
            </button>
            <button
              onClick={() => setFilterType('bot')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'bot' ? 'bg-white text-amber-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Bots & Crawlers ({botCount})
            </button>
          </div>
        </div>

        <button
          onClick={onClear}
          disabled={clicks.length === 0}
          className="text-xs text-slate-500 hover:text-rose-600 font-semibold flex items-center space-x-1 p-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear Feed</span>
        </button>
      </div>

      {/* Live Stream List */}
      <div className="space-y-3">
        {filteredClicks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
            <Radio className="h-10 w-10 mx-auto mb-3 text-slate-300 animate-pulse" />
            <h4 className="text-base font-bold text-slate-700">Listening on Redis Channel...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Open or click any generated shortlink in another tab. The telemetry payload will stream here live.
            </p>
          </div>
        ) : (
          filteredClicks.map((click, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                click.isBot ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 shadow-inner">
                  {getDeviceIcon(click.deviceType)}
                </div>

                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-extrabold text-[#035392] text-sm font-mono">
                      /{click.slug}
                    </span>

                    {click.countryCode && (
                      <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        {click.countryCode}
                      </span>
                    )}

                    {click.isBot ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Bot Filtered ({click.botReason || 'Heuristic'})</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Real Human Visitor</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2 truncate">
                    <span>Target:</span>
                    <span className="font-mono text-slate-700 truncate max-w-md">{click.destinationUrl}</span>
                  </p>
                </div>
              </div>

              {/* Right Metadata */}
              <div className="text-right text-xs space-y-1 shrink-0 self-end md:self-center">
                <div className="font-mono text-slate-800 font-bold">
                  {new Date(click.clickedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[11px] text-slate-400">
                  {click.browser || 'Browser'} • {click.operatingSystem || 'OS'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>GDPR Masked IP Hash</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

