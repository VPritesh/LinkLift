# LinkLift

<p align="center">
  <strong>Enterprise-Grade URL Shortener, Dynamic Redirection Engine & Real-Time Telemetry Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 10" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Redis-Hybrid_L2-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Tests-22_Passed-success?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [⚡ Quick Start in 60 Seconds](#-quick-start-in-60-seconds)
- [Key Features](#-key-features)
  - [High-Throughput Redirection Engine](#-high-throughput-redirection-engine)
  - [Live Telemetry & Radar](#-live-telemetry--radar)
  - [Security, BotShield & GDPR Compliance](#-security-botshield--gdpr-compliance)
  - [Executive Web Dashboard](#-executive-web-dashboard)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [REST API Reference](#-rest-api-reference)
- [Local Development Setup](#-local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Running with Local CLI](#running-with-local-cli)
  - [Running with Docker Compose](#running-with-docker-compose)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Automated Testing & QA](#-automated-testing--qa)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**LinkLift** is a high-performance, self-hosted URL shortener and link orchestration platform built on **ASP.NET Core (.NET 10)** and **React 19**. Engineered for mission-critical throughput, LinkLift combines sub-5ms Redis-cached redirects, dynamic rule-based routing, real-time WebSocket telemetry, bot mitigation, and multi-server fleet management within a Clean Architecture foundation.

Whether running as a lightweight single-node instance backed by SQLite or distributed across a Kubernetes cluster backed by PostgreSQL/SQL Server and Redis Pub/Sub, LinkLift gives engineering and marketing teams complete sovereignty over their shortlinks.

---

## ⚡ Quick Start in 60 Seconds

### Shorten a Link via cURL
Once LinkLift is running, create a shortlink with a single command:

```bash
curl -X POST http://localhost:5000/api/links \
  -H "X-Api-Key: ll_live_master" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com",
    "customSlug": "gh",
    "statusCode": 302
  }'
```

**Response:**
```json
{
  "id": 1,
  "originalUrl": "https://github.com",
  "slug": "gh",
  "shortUrl": "http://localhost:5000/gh",
  "clickCount": 0,
  "statusCode": 302,
  "isActive": true
}
```

### Test Redirection
```bash
curl -I http://localhost:5000/gh
# HTTP/1.1 302 Found
# Location: https://github.com
```

---

## ✨ Key Features

### 🚀 High-Throughput Redirection Engine
- **Base62 Alphanumeric Slugs**: Converts auto-incrementing database IDs into compact, collision-free slugs (e.g., `4c92`).
- **Custom Slugs & Reserved Word Shield**: Strict protection against routing collisions (`/api`, `/health`, `/swagger`, `/hubs`).
- **Full UTF-8 Emoji Support**: Native support for Unicode emoji slugs (e.g., `linklift.io/⚡` or `linklift.io/🚀`).
- **Dynamic Rule Routing Engine**: Priority-based conditional redirection:
  - **Geo-Routing**: Redirect by visitor ISO 3166-1 country code (e.g., US visitors to US store, UK to UK store).
  - **Device-Routing**: Tailored destinations for iOS, Android, Desktop, and Tablet.
  - **Operating System Routing**: Direct Windows, macOS, Linux, and mobile visitors accordingly.
- **Configurable HTTP Status Codes**: Supports HTTP `301` (Permanent), `302` (Found), and `307` (Temporary Redirect).
- **Expiration & Click Thresholds**: Automatic link deactivation upon reaching defined dates or click limits.

### 📡 Live Telemetry & Radar
- **Live SignalR WebSockets**: Instant click events streamed to the dashboard without manual page refreshes.
- **Distributed Redis Pub/Sub**: Real-time multi-node synchronization across server clusters.
- **High-Throughput Channels**: Bounded `System.Threading.Channels` queue with asynchronous batch flushing to prevent database write bottlenecks under heavy traffic spikes.
- **Deep Analytics Breakdown**: Clicks segmented by country, browser, device type, OS, and referrer headers.

### 🛡 Security, BotShield & GDPR Compliance
- **BotShield Heuristics**: Automated filtering of crawlers, preview bots, and scrapers via User-Agent pattern matching and rapid-click thresholds.
- **GDPR SHA-256 IP Hashing**: Anonymizes visitor IPs using daily salt rotation to prevent PII exposure.
- **Automated Data Retention Worker**: `TelemetryRetentionPurgeService` runs daily background sweeps to purge telemetry older than 90 days.
- **Native Sliding-Window Rate Limiting**: ASP.NET Core rate limiting partitioner protecting creation endpoints against burst abuse.
- **Granular API Key Scopes**: Scoped permissions (`links:create`, `analytics:read`, `admin:write`) with SHA-256 token verification.

### 🖥 Executive Web Dashboard
- **Charcoal-Blue Palette**: Executive `#0e1d25` dark sidebar, `#377495` primary brand accent, and crisp `#ecf4f8` card fills.
- **Engineered Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for UI clarity and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for slugs, metrics, and timestamps.
- **Collapsible Vertical Sidebar**: Instant toggle between full `w-72` view and compact `w-20` rail with persistent state and tooltips.
- **Multi-Server Fleet Manager**: Connect to multiple self-hosted LinkLift instances with live millisecond ping latency tests.
- **Client Settings Suite**: Configurable defaults for redirect types, expiration, table densities, telemetry buffers, and JSON backup/restore.
- **Bulk Shortener Wizard**: Batch shortens thousands of URLs with CSV upload, preset format migration, and error reporting.
- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant keyboard navigation, link searches, and modal triggers.
- **Interactive QR Code Generator**: Downloadable SVG and PNG QR codes for every shortened link.

---

## 🏛 Architecture & Tech Stack

LinkLift follows **Clean Architecture** principles, maintaining strict separation of concerns across Domain, Application, Infrastructure, and Presentation layers:

```
                      ┌────────────────────────┐
                      │      LinkLift.Api      │
                      │  (Minimal APIs, Hubs)  │
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

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **API** | ASP.NET Core 10 Minimal APIs, SignalR | HTTP Routing, Auth Middleware, Rate Limiting, OpenAPI |
| **Application** | C# 13, MediatR patterns, FluentValidation | Business Logic, Redirection Engine, Bot Heuristics, DTOs |
| **Domain** | Pure C# (Zero external dependencies) | Entities, Aggregates, Base62 Encoder, Value Objects |
| **Infrastructure** | EF Core 10, StackExchange.Redis, Channels | SQLite / Postgres / SQL Server DbContext, L2 Cache, Background Workers |
| **Frontend** | React 19, TypeScript 5.9, Tailwind CSS 3.4, Vite 8 | Real-Time Dashboard, Telemetry Radar, Multi-Server Fleet Switcher |

### Directory Layout

```
LinkLift/
├── src/
│   ├── LinkLift.Domain/               # Pure domain entities, enums, Base62 encoder
│   ├── LinkLift.Application/          # DTOs, interfaces, RedirectionEngine, GDPR helpers
│   ├── LinkLift.Infrastructure/       # EF Core DbContext, Redis Cache, Bot Detection, Channels
│   ├── LinkLift.Api/                  # Minimal APIs, SignalR Hub, Rate Limiter, Auth Middleware
│   └── LinkLift.Web/                  # React 19 + Vite 8 SPA Dashboard (Tailwind CSS)
├── tests/
│   └── LinkLift.UnitTests/            # xUnit + FluentAssertions unit test suite
├── docs/
│   └── project_requirements.md        # Software Requirements Specification (SRS)
├── docker-compose.yml                 # Multi-container orchestration (API, Web, Redis, DB)
├── CONTRIBUTING.md                    # Open-source contribution guidelines
└── LICENSE.md                         # MIT License
```

---

## 🔌 REST API Reference

All administrative and link creation endpoints require an API Key supplied in the `X-Api-Key` HTTP header.

| Method | Endpoint | Description | Scope Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/{slug}` | Sub-5ms shortlink resolution & redirection | Public |
| `GET` | `/health` | Node health probe & engine uptime | Public |
| `GET` | `/api/links` | List shortlinks with pagination, search, and tags | `links:create` / `admin:write` |
| `POST` | `/api/links` | Create a shortlink with optional dynamic rules | `links:create` / `admin:write` |
| `DELETE`| `/api/links/{id}` | Deactivate and delete a shortlink | `admin:write` |
| `POST` | `/api/links/bulk` | High-throughput batch shortener | `links:create` / `admin:write` |
| `GET` | `/api/analytics/{id}` | Retrieve comprehensive click metrics | `analytics:read` / `admin:write` |
| `GET` | `/api/domains` | List configured custom routing domains | Public |
| `POST` | `/api/domains` | Register a new custom domain | `admin:write` |
| `DELETE`| `/api/domains/{id}` | Remove a custom domain mapping | `admin:write` |
| `GET` | `/api/keys` | List active API keys | `admin:write` |
| `POST` | `/api/keys` | Generate a new scoped API key | `admin:write` |
| `DELETE`| `/api/keys/{id}` | Revoke an API key | `admin:write` |

---

## 🚀 Local Development Setup

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v20+ or v22 LTS)](https://nodejs.org/) & `npm`
- [Docker & Docker Compose](https://www.docker.com/) (optional for containerized deployment)

---

### Running with Local CLI

#### 1. Restore & Run Unit Tests
```bash
dotnet restore LinkLift.slnx
dotnet test LinkLift.slnx
```

#### 2. Start the Backend Web API
```bash
dotnet run --project src/LinkLift.Api/LinkLift.Api.csproj --urls "http://localhost:5000"
```
- **API Health**: [http://localhost:5000/health](http://localhost:5000/health)
- **Swagger / OpenAPI**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **Default Master API Key**: `ll_live_master`

#### 3. Start the Frontend Dashboard
In a separate terminal:
```bash
cd src/LinkLift.Web
npm install
npm run dev
```
- **Web Client Dashboard**: [http://localhost:5173](http://localhost:5173)

---

### Running with Docker Compose

To boot up the complete containerized stack (API, React Client, Redis, and SQL Server):

```bash
docker compose up -d --build
```

- **Web Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Redis Server**: `localhost:6379`
- **SQL Server**: `localhost:1433`

To stop the services:
```bash
docker compose down
```

---

## ⚙ Configuration & Environment Variables

LinkLift is designed for 12-factor cloud deployment. Configure via `appsettings.json` or standard environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DatabaseProvider` | `Sqlite` | Database engine: `SqlServer`, `Postgres`, or `Sqlite` |
| `ConnectionStrings__DefaultConnection` | `Data Source=linklift.db` | Primary database connection string |
| `ConnectionStrings__Redis` | `localhost:6379` | Redis host for L2 distributed cache and SignalR bridge |
| `ASPNETCORE_ENVIRONMENT` | `Development` | ASP.NET Core environment mode (`Development` or `Production`) |

---

## 🧪 Automated Testing & QA

LinkLift includes a comprehensive test suite validating core algorithms, edge cases, and high-throughput components:

```bash
# Execute unit test suite (22 unit tests)
dotnet test LinkLift.slnx

# Execute frontend TypeScript check & production bundle build
cd src/LinkLift.Web
npm run build
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for development workflows, branching strategies, and commit conventions.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
