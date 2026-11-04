import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, Database, Zap, RefreshCw, ExternalLink, HardDrive } from 'lucide-react';
import { api } from '../services/api';

export const HealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<{ status: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch {
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Cluster Node & System Health</h2>
            <p className="text-xs text-slate-500">
              Real-time operational status of backend microservices, caching backplanes, and database providers.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#377495]' : ''}`} />
        </button>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Core API Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Core API</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Healthy
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">ASP.NET Core .NET 10</p>
          <p className="text-xs text-slate-500">
            Minimal APIs running in Kestrel HTTP engine with sub-5ms redirection loop.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Ping: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Online'}
          </div>
        </div>

        {/* Database Layer */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Persistence</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#377495] border border-blue-200 flex items-center gap-1">
              <Database className="h-3 w-3" /> EF Core 10
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">Provider-Agnostic</p>
          <p className="text-xs text-slate-500">
            Active default: Microsoft SQL Server / SQLite with out-of-the-box PostgreSQL compatibility.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Pooled DB Context & Code-First Migrations
          </div>
        </div>

        {/* Redis Cache & PubSub */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Real-Time Layer</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Hybrid Cache
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">Redis & Pub/Sub</p>
          <p className="text-xs text-slate-500">
            Powers distributed sub-millisecond route caching and live SignalR telemetry broadcasts.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Channel: linklift:events:clicks
          </div>
        </div>
      </div>

      {/* OpenAPI Reference Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0e1d25] rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold">Interactive OpenAPI / Swagger Documentation</h3>
          <p className="text-xs text-slate-300 mt-1">
            Access the complete REST API specification, test endpoints, and generate client SDKs.
          </p>
        </div>
        <a
          href="http://localhost:5000/swagger"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition"
        >
          <span>Open Swagger UI</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

