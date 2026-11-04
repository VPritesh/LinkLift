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
  ExternalLink,
  Wifi,
  WifiOff,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  onOpenServerSwitcher,
  isCollapsed,
  onToggleCollapse
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 bg-[#0e1d25] text-slate-200 flex flex-col 
        border-r border-[#1c3a4a] transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Workspace & Server Header with Collapse Toggle */}
        <div className={`h-16 border-b border-[#1c3a4a] bg-[#0a141a] flex items-center transition-all ${
          isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
        }`}>
          {!isCollapsed ? (
            <>
              {/* Expanded Brand & Server Switcher Trigger */}
              <button
                onClick={onOpenServerSwitcher}
                title="Click to switch active cluster / server"
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#142834] transition text-left min-w-0 flex-1 mr-1"
              >
                <div className="h-8 w-8 rounded-lg bg-[#377495] flex items-center justify-center text-white font-bold shadow-md shadow-[#377495]/20 flex-shrink-0">
                  <Link2 className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-base text-white tracking-tight leading-none">
                      LinkLift
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1c3a4a] text-slate-300 border border-[#295770]/40">
                      v1.2
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1 truncate">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                    <span className="truncate max-w-[125px] font-medium">{activeServerName}</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-slate-500 hover:text-slate-300 transition flex-shrink-0" />
              </button>

              {/* Collapse Button */}
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#142834] rounded-lg transition flex-shrink-0"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </>
          ) : (
            /* Collapsed Brand Icon & Expand Button */
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="p-2 text-slate-400 hover:text-white hover:bg-[#142834] rounded-xl transition"
              >
                <PanelLeftOpen className="h-5 w-5 text-cyan-300" />
              </button>
            </div>
          )}
        </div>

        {/* Domain Scope Filter (Only in Expanded Mode) */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 border-b border-[#1c3a4a] bg-[#0a141a]/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px]">Domain Scope</span>
              {selectedDomain && (
                <button 
                  onClick={() => onSelectDomain('')}
                  className="text-xs text-[#8fbdd6] hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedDomain}
                onChange={(e) => onSelectDomain(e.target.value)}
                className="w-full bg-[#142834] text-xs font-medium text-slate-200 rounded-lg px-2.5 py-2 appearance-none border border-[#1c3a4a] focus:outline-none focus:ring-1 focus:ring-[#377495] cursor-pointer pr-8"
              >
                <option value="">Global (All Domains)</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.hostname}>
                    {d.hostname}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto py-3.5 space-y-5 scrollbar-thin scrollbar-thumb-[#1c3a4a] ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {navSections.map((section, idx) => (
            <div key={section.title}>
              {!isCollapsed ? (
                <div className="px-3 text-xs font-bold text-slate-400 tracking-wider mb-2">
                  {section.title}
                </div>
              ) : (
                idx > 0 && <div className="border-t border-[#1c3a4a]/70 my-2 mx-1" />
              )}

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
                      title={`${item.label}${item.badge !== undefined ? ` (${item.badge})` : ''}`}
                      className={`
                        w-full flex items-center rounded-xl text-sm transition-all duration-150 group
                        ${isCollapsed 
                          ? 'justify-center p-3 relative' 
                          : 'justify-between px-3.5 py-2.5'
                        }
                        ${isActive 
                          ? 'bg-[#377495] text-white font-semibold shadow-md shadow-[#377495]/20' 
                          : 'text-slate-300 hover:bg-[#142834] hover:text-white font-medium'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`} />
                        {!isCollapsed && (
                          <span className="truncate text-sm font-semibold tracking-tight">{item.label}</span>
                        )}
                      </div>

                      {/* Badges / Pulses */}
                      {!isCollapsed ? (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {item.pulse && (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                          )}

                          {item.badge !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-[#1c3a4a] text-slate-300 group-hover:bg-[#295770]'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      ) : (
                        /* Collapsed Mode Badge / Pulse Indicator */
                        item.pulse ? (
                          <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        ) : item.badge !== undefined ? (
                          <span className="absolute top-1 right-1 text-[9px] font-mono font-bold px-1 py-0.2 rounded-full bg-[#377495] text-white border border-[#0e1d25]">
                            {item.badge}
                          </span>
                        ) : null
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status Footer */}
        <div className={`border-t border-[#1c3a4a] bg-[#0a141a] transition-all ${
          isCollapsed ? 'p-2 flex flex-col items-center space-y-2' : 'p-3.5 text-xs space-y-2.5'
        }`}>
          {!isCollapsed ? (
            <>
              {/* SignalR Socket status */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center space-x-2">
                  {signalRConnected ? (
                    <Wifi className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-rose-400" />
                  )}
                  <span>Socket Stream</span>
                </span>
                <span className={`font-semibold ${signalRConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {signalRConnected ? 'Live' : 'Reconnecting...'}
                </span>
              </div>

              {/* Engine health + OpenAPI */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>Core Engine</span>
                </span>
                <a 
                  href="http://localhost:5000/swagger" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#8fbdd6] hover:text-white hover:underline flex items-center space-x-1 font-semibold transition"
                >
                  <span>OpenAPI</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </a>
              </div>
            </>
          ) : (
            /* Collapsed Footer Icons */
            <div className="flex flex-col items-center space-y-2 py-1">
              <span 
                title={signalRConnected ? 'Socket Stream: Connected' : 'Socket Stream: Reconnecting...'}
                className="cursor-pointer"
              >
                {signalRConnected ? (
                  <Wifi className="h-4 w-4 text-emerald-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-rose-400" />
                )}
              </span>
              <span 
                title={`Engine Status: ${backendHealthy ? 'Healthy' : 'Degraded'}`}
                className={`h-2.5 w-2.5 rounded-full ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
