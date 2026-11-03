# LinkLift - Enterprise-Grade URL Shortener & Link Orchestration Platform

LinkLift is a high-performance, enterprise-grade, self-hosted URL shortener built on ASP.NET Core (.NET 10), following Clean Architecture and SOLID design principles.

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
   - Entities: [`ShortLink`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/ShortLink.cs), [`ShortLinkRule`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/ShortLinkRule.cs), [`DomainMapping`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/DomainMapping.cs), [`Tag`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/Tag.cs), [`ClickTelemetry`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/ClickTelemetry.cs), [`ApiKey`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Domain/Entities/ApiKey.cs).
   - Utilities: Base62 encoder/decoder (`Base62Encoder.cs`) and system keyword collision protector (`ReservedKeywords.cs`).
2. **LinkLift.Application**:
   - Services: [`ShortLinkService`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Application/Services/ShortLinkService.cs), [`RedirectionEngine`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Application/Services/RedirectionEngine.cs), [`AnalyticsService`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Application/Services/AnalyticsService.cs), [`DomainService`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Application/Services/DomainService.cs), [`ApiKeyService`](file:///c:/Users/prite/source/repos/LinkLift/src/LinkLift.Application/Services/ApiKeyService.cs).
   - Abstractions: `IRepository<T>`, `IShortLinkRepository`, `IUnitOfWork`, `ICacheService`, `IRealtimeEventPublisher`, `IBotDetectionService`, `IDeviceDetector`, `IGeoLookupService`, `IClickTelemetryQueue`.
3. **LinkLift.Infrastructure**:
   - Database Persistence: `LinkLiftDbContext` with EF Core supporting SQL Server, PostgreSQL, and SQLite.
   - Caching: `HybridCacheService` with distributed Redis caching and resilient in-memory fallback.
   - High-Throughput Ingestion: `ChannelClickTelemetryQueue` based on bounded `System.Threading.Channels` and background batch flush processor (`ClickTelemetryBatchProcessor`).
   - Bot & Device Intelligence: Heuristic bot filtering (User-Agent blacklists, 3-second rapid click rules) and user-agent device parsing.
4. **LinkLift.Api**:
   - High-Performance Redirection endpoint (`GET /{slug}`) designed for sub-5ms response under cache-hit conditions.
   - RESTful API endpoints for links, bulk imports, analytics, multi-domain mapping, and API key management with OpenAPI / Swagger documentation (`/swagger`).
   - SignalR hub (`/hub/analytics`) with Redis Pub/Sub backplane bridge (`RedisSignalRBridgeService`).
5. **LinkLift.UnitTests**:
   - Comprehensive test suite covering Base62 encoding, reserved keywords, dynamic rule redirection (geo/device/expiration), bot detection heuristics, and device classification.

---

## 🚀 Getting Started

### 1. Build & Run Tests
```powershell
dotnet restore
dotnet test
```

### 2. Run API Locally
```powershell
dotnet run --project src/LinkLift.Api/LinkLift.Api.csproj
```
Navigate to:
- Swagger UI: `http://localhost:5000/swagger`
- Health check: `http://localhost:5000/health`

### 3. Deploy via Docker Compose
```powershell
docker compose up -d --build
```
This boots up MS SQL Server 2022, Redis, and the containerized LinkLift API instance.

