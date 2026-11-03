import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  RefreshCw, 
  Key,
  HelpCircle,
  Server,
  Settings
} from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface TopBarProps {
  currentView: NavItemKey;
  onOpenMobileSidebar: () => void;
  onOpenCreateDrawer: () => void;
  onOpenCommandPalette: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenApiKeyModal: () => void;
  activeServerName: string;
  onOpenServerSwitcher: () => void;
  onNavigateToSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onOpenMobileSidebar,
  onOpenCreateDrawer,
  onOpenCommandPalette,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  onOpenApiKeyModal,
  activeServerName,
  onOpenServerSwitcher,
  onNavigateToSettings
}) => {
  const getBreadcrumbTitle = (view: NavItemKey) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'links': return 'Link Directory';
      case 'bulk': return 'Bulk Shortening Wizard';
      case 'tags': return 'Campaigns & Tags';
      case 'live': return 'Live Telemetry Radar';
      case 'analytics': return 'Performance & Analytics';
      case 'domains': return 'Custom Domains & Routing';
      case 'apikeys': return 'API Keys & RBAC Scopes';
      case 'botshield': return 'Bot Shield & Compliance';
      case 'health': return 'System Health & Node Status';
      case 'servers': return 'Manage Servers Fleet';
      case 'settings': return 'Client Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>LinkLift</span>
            <span>/</span>
            <span className="text-[#035392] font-semibold">{getBreadcrumbTitle(currentView)}</span>
          </div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            {getBreadcrumbTitle(currentView)}
          </h1>
        </div>
      </div>

      {/* Center: Search / Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div 
          onClick={onOpenCommandPalette}
          className="relative w-full cursor-pointer group"
        >
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 group-hover:text-[#035392] transition" />
          <div className="w-full bg-slate-50 group-hover:bg-slate-100/80 border border-slate-200 text-xs text-slate-500 rounded-lg pl-9 pr-14 py-2 transition flex items-center justify-between">
            <span>Search links, slugs, or commands...</span>
            <div className="flex items-center space-x-1">
              <kbd className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono shadow-sm">
                Ctrl
              </kbd>
              <kbd className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono shadow-sm">
                K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        {/* Active Server Pill */}
        <button
          onClick={onOpenServerSwitcher}
          title="Active Server (Click to switch)"
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200 shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Server className="h-3.5 w-3.5 text-[#035392]" />
          <span className="max-w-[130px] truncate">{activeServerName}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#035392]' : ''}`} />
        </button>

        {/* Settings button */}
        <button
          onClick={onNavigateToSettings}
          title="Client Settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* API Key Selector Button */}
        <button
          onClick={onOpenApiKeyModal}
          title="Configure API Credentials"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200"
        >
          <Key className="h-3.5 w-3.5 text-[#035392]" />
          <span>API Credentials</span>
        </button>

        {/* Primary "+ Create Link" CTA */}
        <button
          onClick={onOpenCreateDrawer}
          className="bg-[#035392] hover:bg-[#024275] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-[#035392]/20 flex items-center space-x-1.5 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Shortlink</span>
        </button>
      </div>
    </header>
  );
};
