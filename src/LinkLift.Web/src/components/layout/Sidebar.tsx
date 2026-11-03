import React from 'react';
import { 
  LayoutDashboard, 
  Link2, 
  Layers, 
  Tag, 
  Activity, 
  BarChart3, 
  Globe, 
  Key, 
  ShieldCheck, 
  Server,
  Settings,
  ChevronRight,
  ExternalLink,
  Wifi,
  WifiOff,
  Sliders
} from 'lucide-react';
import { DomainMapping } from '../../types';

export type NavItemKey = 
  | 'dashboard' 
  | 'links' 
  | 'bulk' 
  | 'tags' 
  | 'live' 
  | 'analytics' 
  | 'domains' 
  | 'apikeys' 
  | 'botshield'
  | 'health'
  | 'servers'
  | 'settings';

interface SidebarNavItem {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  pulse?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarNavItem[];
}

interface SidebarProps {
  currentView: NavItemKey;
  onNavigate: (view: NavItemKey) => void;
  linksCount: number;
  domains: DomainMapping[];
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  signalRConnected: boolean;
  backendHealthy: boolean;
  isOpen: boolean;
  onCloseMobile: () => void;
  activeServerName: string;
  onOpenServerSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  linksCount,
  domains,
  selectedDomain,
  onSelectDomain,
  signalRConnected,
  backendHealthy,
  isOpen,
  onCloseMobile,
  activeServerName,
  onOpenServerSwitcher
}) => {
  const navSections: SidebarSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'LINK MANAGEMENT',
      items: [
        { key: 'links', label: 'All Links', icon: Link2, badge: linksCount },
        { key: 'bulk', label: 'Bulk Shortener', icon: Layers },
        { key: 'tags', label: 'Tags & Campaigns', icon: Tag }
      ]
    },
    {
      title: 'INTELLIGENCE & TELEMETRY',
      items: [
        { 
          key: 'live', 
          label: 'Real-Time Radar', 
          icon: Activity, 
          pulse: signalRConnected 
        },
        { key: 'analytics', label: 'Link Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'ORCHESTRATION',
      items: [
        { key: 'domains', label: 'Custom Domains', icon: Globe, badge: domains.length }
      ]
    },
    {
      title: 'SECURITY & SYSTEM',
      items: [
        { key: 'apikeys', label: 'API Keys & RBAC', icon: Key },
        { key: 'botshield', label: 'Bot Shield & GDPR', icon: ShieldCheck },
        { key: 'health', label: 'System Health', icon: Server }
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { key: 'servers', label: 'Manage Servers', icon: Server },
        { key: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#022c4f] text-slate-200 flex flex-col 
        border-r border-[#033b66] shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#033b66] bg-[#01233f]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#035392] to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                LinkLift
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  v1.2
                </span>
              </span>
              <p className="text-[11px] text-slate-400">Enterprise Orchestrator</p>
            </div>
          </div>
        </div>

        {/* Server Switcher Pill */}
        <div className="px-4 py-2.5 border-b border-[#033b66]/60 bg-[#012038]">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Active Server
          </label>
          <button
            onClick={onOpenServerSwitcher}
            title="Click to switch or configure server"
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#033b66] hover:bg-[#044a80] text-white text-xs transition border border-cyan-500/20 group"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-semibold truncate">{activeServerName}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-cyan-300 group-hover:translate-x-0.5 transition rotate-90 flex-shrink-0" />
          </button>
        </div>

        {/* Domain Scope Selector */}
        <div className="px-4 py-3 border-b border-[#033b66]/60 bg-[#022543]">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Active Scope
          </label>
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => onSelectDomain(e.target.value)}
              className="w-full bg-[#033b66] text-xs text-white rounded-lg px-2.5 py-1.5 appearance-none border border-slate-600/50 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer pr-8"
            >
              <option value="">All Domains (Global Apex)</option>
              {domains.map((d) => (
                <option key={d.id} value={d.hostname}>
                  {d.hostname}
                </option>
              ))}
            </select>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none rotate-90" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onNavigate(item.key);
                        onCloseMobile();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium
                        transition-all duration-150 group
                        ${isActive 
                          ? 'bg-[#035392] text-white shadow-md shadow-[#035392]/30 font-semibold' 
                          : 'text-slate-300 hover:bg-[#033b66]/60 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {item.pulse && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}

                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Health & Live Indicators */}
        <div className="p-4 border-t border-[#033b66] bg-[#01233f] text-xs space-y-2">
          {/* SignalR Socket status */}
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center space-x-1.5">
              {signalRConnected ? (
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span>Telemetry Socket</span>
            </span>
            <span className={`font-semibold ${signalRConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {signalRConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>

          {/* Backend API status */}
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>Core Engine</span>
            </span>
            <a 
              href="http://localhost:5000/swagger" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-0.5"
            >
              <span>OpenAPI</span>
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
