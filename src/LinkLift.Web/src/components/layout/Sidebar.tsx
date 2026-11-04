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
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Wifi,
  WifiOff,
  ChevronsUpDown
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
      title: 'WORKSPACE',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'links', label: 'All Links', icon: Link2, badge: linksCount },
        { key: 'bulk', label: 'Bulk Shortener', icon: Layers },
        { key: 'tags', label: 'Campaigns & Tags', icon: Tag }
      ]
    },
    {
      title: 'MONITORING',
      items: [
        { 
          key: 'live', 
          label: 'Real-Time Radar', 
          icon: Activity, 
          pulse: signalRConnected 
        },
        { key: 'analytics', label: 'Link Analytics', icon: BarChart3 },
        { key: 'health', label: 'System Health', icon: Server }
      ]
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { key: 'domains', label: 'Custom Domains', icon: Globe, badge: domains.length },
        { key: 'botshield', label: 'Bot Shield & GDPR', icon: ShieldCheck },
        { key: 'apikeys', label: 'API Keys & RBAC', icon: Key },
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col 
        border-r border-slate-200 transition-transform duration-300 ease-in-out shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Unified Workspace & Server Header (Linear / Slack Style) */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 bg-white">
          <button
            onClick={onOpenServerSwitcher}
            title="Click to switch active cluster / server"
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition group text-left"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-[#377495] flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                    LinkLift
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    v1.2
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="truncate max-w-[130px] font-medium">{activeServerName}</span>
                </div>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition flex-shrink-0 ml-1" />
          </button>
        </div>

        {/* Domain Scope Filter (Clean In-Line Selector) */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Domain Scope</span>
            {selectedDomain && (
              <button 
                onClick={() => onSelectDomain('')}
                className="text-[10px] text-[#377495] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => onSelectDomain(e.target.value)}
              className="w-full bg-white text-xs text-slate-700 rounded-lg px-2.5 py-1.5 appearance-none border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#377495] cursor-pointer pr-8 shadow-2xs font-medium"
            >
              <option value="">Global (All Domains)</option>
              {domains.map((d) => (
                <option key={d.id} value={d.hostname}>
                  {d.hostname}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">
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
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 group
                        ${isActive 
                          ? 'bg-[#377495] text-white font-semibold shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`h-4 w-4 transition-transform group-hover:scale-105 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {item.pulse && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}

                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
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

        {/* Minimalist Bottom Status Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 text-xs space-y-2">
          {/* SignalR Socket status */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              {signalRConnected ? (
                <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span>Socket Stream</span>
            </span>
            <span className={`font-semibold ${signalRConnected ? 'text-emerald-700' : 'text-rose-600'}`}>
              {signalRConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>

          {/* Engine health + OpenAPI */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>Core Engine</span>
            </span>
            <a 
              href="http://localhost:5000/swagger" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#377495] hover:underline flex items-center space-x-0.5 font-semibold"
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
