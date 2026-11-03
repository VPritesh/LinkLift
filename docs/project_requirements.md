# Software Requirements Specification (SRS): LinkLift

## 1. Executive Summary & Product Vision

**LinkLift** is a high-performance, enterprise-grade, self-hosted URL shortener and link orchestration platform built entirely on the modern **.NET ecosystem** (ASP.NET Core). Designed as a robust, secure, and feature-rich alternative to commercial link shorteners, LinkLift provides complete data ownership, sub-millisecond redirection via Redis caching, real-time telemetry, multi-domain management, bot filtering, and robust API-first capabilities.

---

## 2. Technical Stack & Architecture

* **Backend Framework:** ASP.NET Core (.NET 10 / Minimal APIs & Controllers).
* **Primary Database (Default):** **Microsoft SQL Server (MS SQL)** with Entity Framework Core code-first migrations.
* **Database Agnosticism:** Provider-agnostic design leveraging EF Core abstractions. Out-of-the-box configuration support for **PostgreSQL**, **SQLite**, and **MySQL/MariaDB** via environment variables.
* **Caching & Real-Time Layer:** Redis (used for caching short links for sub-millisecond redirects and powering Redis Pub/Sub for real-time SignalR click events).
* **Frontend Dashboard:** React + Vite + Tailwind CSS (High-contrast corporate royal blue `#035392`, slate gray, and clean white theme).
* **Containerization:** Multi-stage Dockerfiles and `docker-compose.yml` for seamless deployment.

---

## 3. Comprehensive Functional Requirements

### 3.1. Link Shortening & Slug Generation
* **Base62 ID Encoding:** Convert auto-incrementing database `BIGINT` primary keys into compact, collision-free alphanumeric strings (e.g., ID `1000000` $\rightarrow$ `4c92`).
* **Custom Slugs:** Allow users to define custom keywords/slugs (e.g., `linklift.io/summer-sale`) with uniqueness validation and automated protection against reserved system words (`api`, `health`, `login`, `swagger`).
* **Emoji Support:** Full UTF-8 support allowing emojis in slugs, tags, and campaign names (e.g., `linklift.io/🚀`).

### 3.2. Multi-Domain & Custom Domain Management
* **Apex & Subdomain Support:** Host links across multiple custom corporate domains (e.g., `mybrand.com/xyz` or `go.mybrand.io/xyz`).
* **Dynamic Routing:** Multi-tenant domain binding mapped directly in the database and cached via Redis for ultra-fast edge resolution.

### 3.3. Advanced Redirection & Dynamic Rules
* **Redirect Protocols:** Support HTTP 301 (Permanent - cached by browsers) and HTTP 302/307 (Temporary - ensures 100% click telemetry capture).
* **Target Rules:** 
  * Geo-routing (redirect users based on country/IP origin).
  * Device-routing (direct iOS, Android, and Desktop users to different landing pages).
  * Expiration controls (links automatically deactivate after a specific date/time or click threshold).

### 3.4. Real-Time Telemetry & Analytics
* **Deep Click Metrics:** Capture timestamp, HTTP Referrer, User-Agent, device type, operating system, browser, country, and hashed IP address.
* **Real-Time Dashboard Updates:** Leverage **Redis Pub/Sub** and **SignalR** to stream live click events directly to the user dashboard instantly without manual page refreshes.

### 3.5. Organization & Tagging
* **Tags & Categories:** Group links by campaign, department, client, or project using flexible tagging.
* **Search & Filter:** Advanced filtering capabilities in the dashboard by date range, tag, custom domain, and performance.

### 3.6. Security, Bot Detection & Compliance
* **Bot Filtering:** Implement heuristic checks (User-Agent blacklists, ASN filtering, and the 3-second rapid-click rule) to filter out automated security crawlers, web scrapers, and preview bots from real user analytics.
* **GDPR Compliance:** Built-in IP anonymization flags, user consent tracking, and configurable data-retention purging policies to comply with regional data privacy regulations.

### 3.7. API-First Architecture & Key Management
* **RESTful Endpoints:** Fully documented via OpenAPI / Swagger (`/swagger`). Every core dashboard feature is fully accessible via API.
* **API Key Roles & RBAC:** Granular Role-Based Access Control for API keys—scopes include `links:create`, `analytics:read`, and `admin:write`.

### 3.8. Integrations & Data Portability
* **Third-Party Imports:** CSV/JSON bulk import wizard allowing seamless migration of existing link portfolios from standard shortlink exports, CSV archives, or legacy databases.
* **Bulk Shortening:** High-throughput API endpoint and CSV upload tool to process thousands of URLs concurrently using asynchronous `System.Threading.Channels` and batch database writes.

---

## 4. Non-Functional Requirements

* **Performance:** Redirection endpoint (`GET /{shortCode}`) must resolve in under 5ms under standard cache-hit conditions.
* **Scalability:** Designed for horizontal scaling behind an Nginx or YARP (Yet Another Reverse Proxy) load balancer.
* **Security & Hardening:** Protection against SQL Injection via Entity Framework Core parameterization, rate limiting on shortening endpoints to prevent abuse, and enumeration attack mitigation.
* **Database Portability:** EF Core database context configured cleanly to switch between MS SQL Server, PostgreSQL, and SQLite via a single connection string change in `appsettings.json` or environment variables.

---

## 5. Deployment & Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  linklift-api:
    build:
      context: .
      dockerfile: src/LinkLift.Api/Dockerfile
    ports:
      - "5000:8080"
    environment:
      - DatabaseProvider=SqlServer # Options: SqlServer, Postgres, Sqlite
      - ConnectionStrings__DefaultConnection=Server=db;Database=LinkLiftDb;User=sa;Password=YourStrongPassword123;TrustServerCertificate=true;
      - ConnectionStrings__Redis=redis:6379
    depends_on:
      - db
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrongPassword123
    ports:
      - "1433:1433"
```