import { 
  ShortLink, 
  CreateShortLinkRequest, 
  BulkShortenRequest, 
  BulkShortenResponse,
  DomainMapping, 
  CreateDomainRequest, 
  ApiKey, 
  CreateApiKeyRequest, 
  LinkAnalyticsSummary 
} from '../types';
import { serverConfigService } from './serverConfig';

export const DEFAULT_API_KEY = 'll_live_master';

export const getActiveApiBase = (): string => {
  return serverConfigService.getActiveServer().url.replace(/\/+$/, '');
};

const getHeaders = () => {
  const activeServer = serverConfigService.getActiveServer();
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': activeServer.apiKey || 'll_live_master'
  };
};

export const api = {
  // Test connection to arbitrary server
  async testConnection(url: string, apiKey: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const cleanUrl = url.replace(/\/+$/, '');
    const startTime = performance.now();
    try {
      const healthRes = await fetch(`${cleanUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(6000)
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (!healthRes.ok) {
        return { success: false, latencyMs, message: `Health endpoint returned status ${healthRes.status}` };
      }

      // Check API Key validation against /api/links
      const authRes = await fetch(`${cleanUrl}/api/links`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        },
        signal: AbortSignal.timeout(6000)
      });

      if (authRes.status === 401 || authRes.status === 403) {
        return { success: false, latencyMs, message: 'Server reached, but API Key was rejected (Unauthorized).' };
      }

      return { success: true, latencyMs, message: `Connection established (${latencyMs}ms)` };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return { success: false, latencyMs, message: err.message || 'Connection timed out or failed' };
    }
  },

  // Links
  async getLinks(search?: string, tag?: string, domain?: string): Promise<ShortLink[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (domain) params.append('domain', domain);

    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/links?${params.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch links');
    return res.json();
  },

  async createLink(request: CreateShortLinkRequest): Promise<ShortLink> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/links`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to create link');
    }
    return res.json();
  },

  async deleteLink(id: number): Promise<boolean> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/links/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.status === 204 || res.ok;
  },

  async bulkShorten(request: BulkShortenRequest): Promise<BulkShortenResponse> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/links/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to process bulk shortening');
    }
    return res.json();
  },

  // Analytics
  async getAnalyticsBySlug(slug: string): Promise<LinkAnalyticsSummary> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/analytics/slug/${encodeURIComponent(slug)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getAnalyticsById(id: number): Promise<LinkAnalyticsSummary> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/analytics/link/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Domains
  async getDomains(): Promise<DomainMapping[]> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/domains`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch domains');
    return res.json();
  },

  async createDomain(request: CreateDomainRequest): Promise<DomainMapping> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/domains`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to add domain');
    }
    return res.json();
  },

  async deleteDomain(id: number): Promise<boolean> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/domains/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.status === 204 || res.ok;
  },

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/keys`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch API keys');
    return res.json();
  },

  async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/keys`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to create API key');
    }
    return res.json();
  },

  async revokeApiKey(id: number): Promise<boolean> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/api/keys/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.status === 204 || res.ok;
  },

  // Health
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    const base = getActiveApiBase();
    const res = await fetch(`${base}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
  }
};
