import { ServerConfig, ClientSettings } from '../types';

const STORAGE_SERVERS_KEY = 'linklift_servers_config';
const STORAGE_ACTIVE_SERVER_KEY = 'linklift_active_server_id';
const STORAGE_SETTINGS_KEY = 'linklift_client_settings';

const DEFAULT_SERVER: ServerConfig = {
  id: 'local-default',
  name: 'Local LinkLift Engine',
  url: 'http://localhost:5000',
  apiKey: 'll_live_master',
  isDefault: true,
  createdAt: new Date().toISOString()
};

const DEFAULT_SETTINGS: ClientSettings = {
  defaultRedirectType: 302,
  defaultExpirationDays: null,
  linksPerPage: 25,
  telemetryBufferLimit: 100,
  autoRefreshInterval: 15
};

export const serverConfigService = {
  getServers(): ServerConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_SERVERS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify([DEFAULT_SERVER]));
        return [DEFAULT_SERVER];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify([DEFAULT_SERVER]));
        return [DEFAULT_SERVER];
      }
      return parsed;
    } catch {
      return [DEFAULT_SERVER];
    }
  },

  getActiveServer(): ServerConfig {
    const servers = this.getServers();
    const activeId = localStorage.getItem(STORAGE_ACTIVE_SERVER_KEY);
    const found = servers.find(s => s.id === activeId);
    if (found) return found;

    // Fallback to first or default
    const fallback = servers.find(s => s.isDefault) || servers[0] || DEFAULT_SERVER;
    localStorage.setItem(STORAGE_ACTIVE_SERVER_KEY, fallback.id);
    return fallback;
  },

  setActiveServer(id: string): ServerConfig {
    const servers = this.getServers();
    const target = servers.find(s => s.id === id);
    if (!target) throw new Error(`Server with id "${id}" not found.`);
    localStorage.setItem(STORAGE_ACTIVE_SERVER_KEY, id);
    return target;
  },

  addServer(server: Omit<ServerConfig, 'id'>): ServerConfig {
    const servers = this.getServers();
    const newServer: ServerConfig = {
      ...server,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };

    if (newServer.isDefault) {
      servers.forEach(s => s.isDefault = false);
    }

    const updated = [...servers, newServer];
    localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(updated));
    return newServer;
  },

  updateServer(id: string, updates: Partial<ServerConfig>): ServerConfig {
    const servers = this.getServers();
    const idx = servers.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Server with id "${id}" not found.`);

    if (updates.isDefault) {
      servers.forEach(s => s.isDefault = false);
    }

    servers[idx] = { ...servers[idx], ...updates };
    localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(servers));
    return servers[idx];
  },

  deleteServer(id: string): void {
    const servers = this.getServers();
    if (servers.length <= 1) {
      throw new Error('Cannot delete the only configured server.');
    }
    const filtered = servers.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(filtered));

    // If deleting active server, switch to another
    const activeId = localStorage.getItem(STORAGE_ACTIVE_SERVER_KEY);
    if (activeId === id) {
      const nextActive = filtered.find(s => s.isDefault) || filtered[0];
      localStorage.setItem(STORAGE_ACTIVE_SERVER_KEY, nextActive.id);
    }
  },

  getSettings(): ClientSettings {
    try {
      const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(updates: Partial<ClientSettings>): ClientSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  exportConfig(): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      servers: this.getServers(),
      activeServerId: this.getActiveServer().id,
      settings: this.getSettings()
    };
    return JSON.stringify(exportData, null, 2);
  },

  importConfig(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.servers && Array.isArray(parsed.servers) && parsed.servers.length > 0) {
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(parsed.servers));
        if (parsed.activeServerId) {
          localStorage.setItem(STORAGE_ACTIVE_SERVER_KEY, parsed.activeServerId);
        }
        if (parsed.settings) {
          localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(parsed.settings));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};

