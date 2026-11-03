import React, { useState, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './views/DashboardView';
import { LinksListView } from './views/LinksListView';
import { BulkShortenView } from './views/BulkShortenView';
import { TagsView } from './views/TagsView';
import { LiveTelemetryView } from './views/LiveTelemetryView';
import { LinkAnalyticsView } from './views/LinkAnalyticsView';
import { DomainsView } from './views/DomainsView';
import { ApiKeysView } from './views/ApiKeysView';
import { BotShieldView } from './views/BotShieldView';
import { HealthView } from './views/HealthView';
import { ManageServersView } from './views/ManageServersView';
import { SettingsView } from './views/SettingsView';
import { CreateLinkDrawer } from './components/modals/CreateLinkDrawer';
import { QRCodeModal } from './components/modals/QRCodeModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { ServerSwitcherModal } from './components/modals/ServerSwitcherModal';
import { api, getActiveApiBase } from './services/api';
import { serverConfigService } from './services/serverConfig';
import { 
  ShortLink, 
  ClickEventNotification, 
  DomainMapping, 
  CreateShortLinkRequest, 
  CreateDomainRequest,
  ServerConfig 
} from './types';

export function App() {
  const [currentView, setCurrentView] = useState<NavItemKey>('dashboard');
  const [activeServer, setActiveServer] = useState<ServerConfig>(serverConfigService.getActiveServer());
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [liveClicks, setLiveClicks] = useState<ClickEventNotification[]>([]);
  const [domains, setDomains] = useState<DomainMapping[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals / Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [qrModalLink, setQrModalLink] = useState<ShortLink | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [serverSwitcherOpen, setServerSwitcherOpen] = useState(false);
  const [analyticsSlug, setAnalyticsSlug] = useState<string | null>(null);

  // Connectivity
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [linksData, domainsData] = await Promise.all([
        api.getLinks(searchQuery, undefined, selectedDomain || undefined).catch(() => []),
        api.getDomains().catch(() => [])
      ]);
      setLinks(linksData);
      setDomains(domainsData);
      setBackendHealthy(true);
    } catch {
      setBackendHealthy(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedDomain]);

  useEffect(() => {
    loadData();
  }, [loadData, activeServer.id]);

  // Handle active server switch
  const handleServerSwitched = (newServer: ServerConfig) => {
    setActiveServer(newServer);
    setLiveClicks([]);
    loadData();
  };

  // Setup SignalR Hub Connection dynamically bound to active server
  useEffect(() => {
    const apiBase = getActiveApiBase();
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBase}/hub/analytics`)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveClickEvent', (click: ClickEventNotification) => {
      setLiveClicks(prev => [click, ...prev.slice(0, 99)]);
      // Increment click count for the target link in state
      setLinks(prev => prev.map(l => 
        l.id === click.shortLinkId ? { ...l, clickCount: l.clickCount + 1 } : l
      ));
    });

    connection.start()
      .then(() => setSignalRConnected(true))
      .catch(() => setSignalRConnected(false));

    connection.onreconnecting(() => setSignalRConnected(false));
    connection.onreconnected(() => setSignalRConnected(true));
    connection.onclose(() => setSignalRConnected(false));

    return () => {
      connection.stop();
    };
  }, [activeServer.id]);

  // Global Keyboard shortcut Ctrl+K / Cmd+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Actions
  const handleCreateLink = async (payload: CreateShortLinkRequest) => {
    await api.createLink(payload);
    await loadData();
    setCurrentView('links');
  };

  const handleDeleteLink = async (id: number) => {
    await api.deleteLink(id);
    await loadData();
  };

  const handleAddDomain = async (req: CreateDomainRequest) => {
    await api.createDomain(req);
    await loadData();
  };

  const handleDeleteDomain = async (id: number) => {
    await api.deleteDomain(id);
    await loadData();
  };

  const handleViewAnalytics = (slug: string) => {
    setAnalyticsSlug(slug);
    setCurrentView('analytics');
  };

  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
    setCurrentView('links');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        linksCount={links.length}
        domains={domains}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        signalRConnected={signalRConnected}
        backendHealthy={backendHealthy}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        activeServerName={activeServer.name}
        onOpenServerSwitcher={() => setServerSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top App Bar */}
        <TopBar
          currentView={currentView}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          activeServerName={activeServer.name}
          onOpenServerSwitcher={() => setServerSwitcherOpen(true)}
          onNavigateToSettings={() => setCurrentView('settings')}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              links={links}
              liveClicks={liveClicks}
              onNavigate={setCurrentView}
              onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
              onOpenQRCode={(link) => setQrModalLink(link)}
              domainsCount={domains.length}
            />
          )}

          {currentView === 'links' && (
            <LinksListView
              links={links}
              domains={domains}
              onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
              onOpenQRCode={(link) => setQrModalLink(link)}
              onViewAnalytics={handleViewAnalytics}
              onDeleteLink={handleDeleteLink}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentView === 'bulk' && (
            <BulkShortenView onReloadLinks={loadData} />
          )}

          {currentView === 'tags' && (
            <TagsView links={links} onSelectTag={handleSelectTag} />
          )}

          {currentView === 'live' && (
            <LiveTelemetryView
              clicks={liveClicks}
              onClear={() => setLiveClicks([])}
              isConnected={signalRConnected}
            />
          )}

          {currentView === 'analytics' && (
            <LinkAnalyticsView
              links={links}
              initialSlug={analyticsSlug}
            />
          )}

          {currentView === 'domains' && (
            <DomainsView
              domains={domains}
              onAddDomain={handleAddDomain}
              onDeleteDomain={handleDeleteDomain}
            />
          )}

          {currentView === 'apikeys' && (
            <ApiKeysView />
          )}

          {currentView === 'botshield' && (
            <BotShieldView />
          )}

          {currentView === 'health' && (
            <HealthView />
          )}

          {currentView === 'servers' && (
            <ManageServersView onServerSwitched={handleServerSwitched} />
          )}

          {currentView === 'settings' && (
            <SettingsView onNavigateToServers={() => setCurrentView('servers')} />
          )}
        </main>
      </div>

      {/* Slide-over Create Link Drawer */}
      <CreateLinkDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSubmit={handleCreateLink}
        domains={domains}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        link={qrModalLink}
        onClose={() => setQrModalLink(null)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={loadData}
      />

      {/* Server Switcher Modal */}
      <ServerSwitcherModal
        isOpen={serverSwitcherOpen}
        onClose={() => setServerSwitcherOpen(false)}
        activeServer={activeServer}
        onServerSelected={handleServerSwitched}
        onNavigateToManageServers={() => setCurrentView('servers')}
      />

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        links={links}
        onNavigate={setCurrentView}
        onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
        onViewAnalytics={handleViewAnalytics}
      />
    </div>
  );
}

export default App;
