# LinkLift - Enterprise-Grade URL Shortener & Link Orchestration Platform

LinkLift is a high-performance, enterprise-grade, self-hosted URL shortener and link orchestration platform built on ASP.NET Core (.NET 10) and React 19, following Clean Architecture, SOLID design principles, and modern UX standards.

---

## 🏛 Architecture Overview

```
                      ┌────────────────────────┐
                      │      LinkLift.Api      │
                      │  (Endpoints, SignalR)  │
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │  LinkLift.Application  │
                      │ (Services, DTOs, Core) │
                      └─────┬────────────┬─────┘
                            │            │
             ┌──────────────┘            └──────────────┐
             ▼                                          ▼
┌────────────────────────┐                  ┌────────────────────────┐
│    LinkLift.Domain     │                  │LinkLift.Infrastructure │
│  (Entities, Utilities) │                  │(EF Core, Redis, Queue) │
└────────────────────────┘                  └────────────────────────┘
```

### Core Layers:
1. **LinkLift.Domain**:
   - Entities: `ShortLink`, `ShortLinkRule`, `DomainMapping`, `Tag`, `ClickTelemetry`, `ApiKey`.
   - Utilities: Base62 encoder/decoder (`Base62Encoder.cs`) and system keyword collision protector (`ReservedKeywords.cs`).
2. **LinkLift.Application**:
   - Services: `ShortLinkService`, `RedirectionEngine`, `AnalyticsService`, `DomainService`, `ApiKeyService`.
   - Abstractions: `IRepository<T>`, `IShortLinkRepository`, `IUnitOfWork`, `ICacheService`, `IRealtimeEventPublisher`, `IBotDetectionService`, `IDeviceDetector`, `IGeoLookupService`, `IClickTelemetryQueue`.
   - Utilities: `AnonymizationHelper` (GDPR SHA-256 IP anonymization).
3. **LinkLift.Infrastructure**:
   - Database Persistence: `LinkLiftDbContext` with EF Core supporting SQL Server, PostgreSQL, and SQLite.
   - Caching: `HybridCacheService` with distributed Redis caching and resilient in-memory fallback.
   - High-Throughput Ingestion: `ChannelClickTelemetryQueue` based on bounded `System.Threading.Channels` and background batch flush processor (`ClickTelemetryBatchProcessor`).
   - Automated Retention: `TelemetryRetentionPurgeService` daily background worker for GDPR 90-day retention purging.
   - Bot & Device Intelligence: Heuristic bot filtering (User-Agent blacklists, ASN detection, 3-second rapid click rules) and user-agent device parsing.
4. **LinkLift.Api**:
   - High-Performance Redirection endpoint (`GET /{slug}`) designed for sub-5ms response under cache-hit conditions.
   - Rate Limiting: Native ASP.NET Core sliding-window rate limiting on shortening endpoints.
   - RESTful API endpoints for links, bulk imports, analytics, multi-domain mapping, and API key management with OpenAPI / Swagger documentation (`/swagger`).
   - SignalR hub (`/hub/analytics`) with Redis Pub/Sub backplane bridge (`RedisSignalRBridgeService`).
5. **LinkLift.Web**:
   - Modern React 19 + Vite 8 dashboard styled with the Charcoal-Blue executive palette and Plus Jakarta Sans + JetBrains Mono typography.
   - Collapsible & expandable vertical sidebar navigation with persistent state.
   - Unified workspace and server switcher, multi-server fleet management, real-time telemetry stream, bulk shortening wizard, QR code generator, and global command palette (`Ctrl+K`).
6. **LinkLift.UnitTests**:
   - Comprehensive test suite covering Base62 encoding, reserved keywords, dynamic rule redirection (geo/device/expiration), bot detection heuristics, and device classification.

---

## 🚀 Getting Started

### 1. Build & Run Tests
```powershell
dotnet restore LinkLift.slnx
dotnet test LinkLift.slnx
```

### 2. Run API Locally
```powershell
dotnet run --project src/LinkLift.Api/LinkLift.Api.csproj --urls "http://localhost:5000"
```
Navigate to:
- Swagger UI: `http://localhost:5000/swagger`
- Health check: `http://localhost:5000/health`
- Default Master API Key: `ll_live_master`

### 3. Run Web Dashboard Locally
```powershell
cd src/LinkLift.Web
npm install
npm run dev
```
Navigate to:
- Dashboard: `http://localhost:5173`

### 4. Deploy via Docker Compose
```powershell
docker compose up -d --build
```
This boots up MS SQL Server 2022, Redis, the containerized LinkLift API instance (port `5000`), and the Nginx-hosted React Web Client (port `3000`).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 Contributing
Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
