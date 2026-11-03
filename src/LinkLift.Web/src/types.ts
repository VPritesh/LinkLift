export interface ShortLink {
  id: number;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  title: string | null;
  description: string | null;
  redirectType: number; // 301, 302, 307
  isActive: boolean;
  domainHostname: string | null;
  expiresAtUtc: string | null;
  maxClicks: number | null;
  clickCount: number;
  createdAtUtc: string;
  tags: string[];
  rules: ShortLinkRule[];
}

export interface ShortLinkRule {
  id?: number;
  ruleType: number; // 1: Country, 2: Device, 3: OperatingSystem
  matchValue: string;
  targetUrl: string;
  priority: number;
}

export interface CreateShortLinkRequest {
  originalUrl: string;
  customSlug?: string | null;
  title?: string | null;
  description?: string | null;
  redirectType?: number;
  domainHostname?: string | null;
  expiresAtUtc?: string | null;
  maxClicks?: number | null;
  tags?: string[];
  rules?: ShortLinkRule[];
}

export interface BulkShortenItemRequest {
  originalUrl: string;
  customSlug?: string | null;
  title?: string | null;
}

export interface BulkShortenRequest {
  links: BulkShortenItemRequest[];
}

export interface BulkShortenResultItem {
  originalUrl: string;
  shortUrl: string | null;
  slug: string | null;
  success: boolean;
  errorMessage: string | null;
}

export interface BulkShortenResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: BulkShortenResultItem[];
}

export interface ClickEventNotification {
  shortLinkId: number;
  slug: string;
  destinationUrl: string;
  clickedAtUtc: string;
  referrer: string | null;
  deviceType: number; // 0: Unknown, 1: Desktop, 2: Mobile, 3: Tablet, 4: Bot
  operatingSystem: string | null;
  browser: string | null;
  countryCode: string | null;
  isBot: boolean;
  botReason?: string | null;
}

export interface ClickItemDto {
  clickedAtUtc: string;
  countryCode: string | null;
  deviceType: number;
  operatingSystem: string | null;
  browser: string | null;
  referrer: string | null;
  isBot: boolean;
  botReason: string | null;
}

export interface LinkAnalyticsSummary {
  shortLinkId: number;
  slug: string;
  totalClicks: number;
  realClicks: number;
  botClicks: number;
  clicksByCountry: Record<string, number>;
  clicksByDevice: Record<string, number>;
  clicksByBrowser: Record<string, number>;
  clicksByOs: Record<string, number>;
  clicksByReferrer: Record<string, number>;
  recentClicks: ClickItemDto[];
}

export interface DomainMapping {
  id: number;
  hostname: string;
  isActive: boolean;
  customNotFoundUrl: string | null;
  description: string | null;
  linkCount: number;
}

export interface CreateDomainRequest {
  hostname: string;
  customNotFoundUrl?: string | null;
  description?: string | null;
}

export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  scopes: string;
  isActive: boolean;
  createdAtUtc: string;
  lastUsedAtUtc: string | null;
  plainTextKey?: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string;
}

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface ClientSettings {
  defaultRedirectType: number; // 302, 301, 307
  defaultExpirationDays: number | null;
  linksPerPage: number;
  telemetryBufferLimit: number;
  autoRefreshInterval: number; // in seconds
}


