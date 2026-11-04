# Contributing to LinkLift

Thank you for your interest in contributing to **LinkLift**! As an enterprise-grade, high-throughput URL shortener and link orchestration platform, we welcome contributions ranging from bug fixes and documentation enhancements to new dynamic routing capabilities and telemetry plugins.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Setting Up Your Development Environment](#setting-up-your-development-environment)
5. [Running the Application Locally](#running-the-application-locally)
6. [Running Tests](#running-tests)
7. [Coding Standards & Guidelines](#coding-standards--guidelines)
8. [Commit Message Conventions](#commit-message-conventions)
9. [Submitting a Pull Request](#submitting-a-pull-request)
10. [Security & Vulnerability Reporting](#security--vulnerability-reporting)

---

## 1. Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful, constructive, and collaborative in all issues, pull requests, and discussions.

---

## 2. Architecture Overview
LinkLift follows **Clean Architecture** and strict **SOLID principles**:

- `src/LinkLift.Domain`: Pure domain entities (`ShortLink`, `ClickTelemetry`, `DomainMapping`, `ApiKey`), domain enums (`RedirectType`, `DeviceType`), Base62 encoding utility, and reserved system keywords. Contains zero external database or framework dependencies.
- `src/LinkLift.Application`: Application contracts, DTOs, interfaces (`IRepository`, `IUnitOfWork`, `ICacheService`), business rules, `RedirectionEngine` (Geo/Device/OS priority routing), and GDPR anonymization helpers.
- `src/LinkLift.Infrastructure`: Entity Framework Core DbContext (supporting SQL Server, PostgreSQL, and SQLite), Redis hybrid caching layer, BotShield heuristic detection, non-blocking `System.Threading.Channels` telemetry batch writer, and background retention workers.
- `src/LinkLift.Api`: ASP.NET Core Minimal APIs, native sliding-window rate limiting, scoped API Key authorization middleware, and SignalR telemetry hubs.
- `src/LinkLift.Web`: React 19 + Vite 8 + Tailwind CSS frontend dashboard styled with the Charcoal-Blue palette, Plus Jakarta Sans & JetBrains Mono typography, and multi-server configuration suite.
- `tests/LinkLift.UnitTests`: xUnit + FluentAssertions unit test suite.

---

## 3. Prerequisites
Ensure you have the following installed locally:
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v20+ or v22 LTS)](https://nodejs.org/) & `npm`
- [Docker & Docker Compose](https://www.docker.com/) (optional, for containerized local databases and Redis)
- [Git](https://git-scm.com/)

---

## 4. Setting Up Your Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/LinkLift.git
   cd LinkLift
   ```

2. **Restore .NET Dependencies:**
   ```bash
   dotnet restore LinkLift.slnx
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd src/LinkLift.Web
   npm install
   cd ../..
   ```

---

## 5. Running the Application Locally

### Option A: Local CLI Execution (Recommended for Fast Iteration)

1. **Start the Backend API:**
   ```bash
   dotnet run --project src/LinkLift.Api/LinkLift.Api.csproj --urls "http://localhost:5000"
   ```
   - Swagger / OpenAPI documentation will be accessible at: `http://localhost:5000/swagger`
   - Health endpoint: `http://localhost:5000/health`
   - Default master developer API key: `ll_live_master`

2. **Start the Frontend Web Client:**
   In a separate terminal:
   ```bash
   cd src/LinkLift.Web
   npm run dev
   ```
   - Frontend dashboard will be accessible at: `http://localhost:5173`

### Option B: Docker Compose Full Stack (Production Mirror)

To run the complete system with SQL Server, Redis, the .NET Web API, and Nginx-backed Web Client:
```bash
docker-compose up --build
```
- Web Client: `http://localhost:3000`
- API Backend: `http://localhost:5000`

---

## 6. Running Tests

Before submitting any code changes, all unit tests must pass:

```bash
# Run all unit tests
dotnet test LinkLift.slnx

# Run frontend production build check
cd src/LinkLift.Web
npm run build
cd ../..
```

---

## 7. Coding Standards & Guidelines

### Backend (.NET 10 / C#)
- Adhere to Clean Architecture:
  - Do not introduce database dependencies into `Domain` or `Application`.
  - Interfaces belong in `Application.Common.Interfaces`; implementations belong in `Infrastructure`.
- Avoid hardcoding connection strings or secret tokens; use `appsettings.json` or environment variables.
- Ensure all public redirection paths maintain sub-5ms latency by leveraging `ICacheService`.
- Maintain GDPR compliance: click telemetry IP addresses must always be hashed via `AnonymizationHelper.HashIpAddress(...)`.

### Frontend (React / TypeScript / Tailwind)
- Do not introduce arbitrary inline hex colors that break the **Charcoal-Blue** design system. Use configured `brand` / `charcoal` Tailwind shades (`50` through `950`).
- Use **Plus Jakarta Sans** for UI and **JetBrains Mono** (`font-mono`) for slugs, metrics, timestamps, and codes.
- Ensure all views maintain uniform layout width (`max-w-7xl w-full mx-auto space-y-6`).
- Verify TypeScript types compile cleanly with `npm run build` (`tsc -b && vite build`).

---

## 8. Commit Message Conventions
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` Introduces a new feature or endpoint (e.g., `feat: add geo-routing rule by continent`)
- `fix:` Fixes a bug (e.g., `fix: resolve sliding-window rate limit header race condition`)
- `docs:` Changes to documentation or requirements (e.g., `docs: update deployment guidelines`)
- `refactor:` Code improvements without changing external behavior
- `test:` Adding or updating unit/integration tests
- `perf:` Performance optimizations (e.g., caching, batch channel tuning)
- `chore:` Dependency bumps, build configs, or maintenance

---

## 9. Submitting a Pull Request

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes following the coding standards above.
3. Verify that both `dotnet test` and `npm run build` pass with zero errors and zero warnings.
4. Commit your changes using conventional commit messages.
5. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
6. Open a Pull Request against the `main` branch. Provide a clear description of:
   - What the PR accomplishes.
   - Any architectural design decisions made.
   - Proof of test passing.

---

## 10. Security & Vulnerability Reporting
Please **do not** open public GitHub issues for security vulnerabilities. If you discover a security vulnerability (such as an authentication bypass or rate limit circumvention), please report it responsibly by contacting the maintainers directly.

Thank you for helping make LinkLift the most reliable and high-performance link orchestration platform!

