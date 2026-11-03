using LinkLift.Api.Hubs;
using LinkLift.Api.Middleware;
using LinkLift.Api.Services;
using LinkLift.Application;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using LinkLift.Application.Common.Utilities;
using LinkLift.Application.DTOs;
using LinkLift.Application.Services;
using LinkLift.Domain.Entities;
using LinkLift.Infrastructure;
using LinkLift.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Register Core Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add SignalR & Hosted Relays
builder.Services.AddSignalR();
builder.Services.AddHostedService<RedisSignalRBridgeService>();

// Add Endpoints API Explorer & Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "LinkLift API", Version = "v1", Description = "Enterprise-Grade URL Shortener & Link Orchestration Platform" });
    c.AddSecurityDefinition("ApiKey", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "X-Api-Key",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Description = "API Key authentication using the 'X-Api-Key' header"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Rate Limiting (SRS §4 Security & Hardening)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("shorten_policy", opt =>
    {
        opt.PermitLimit = 120; // 120 creation requests per minute
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 20;
    });
});

var app = builder.Build();

// Ensure Database is Created & Seed Master Key for local dev
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LinkLiftDbContext>();
    db.Database.EnsureCreated();

    if (!db.ApiKeys.Any())
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var keyHash = Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes("ll_live_master"))).ToLowerInvariant();
        db.ApiKeys.Add(new ApiKey
        {
            Name = "Development Master Key",
            KeyPrefix = "ll_live_mast",
            KeyHash = keyHash,
            Scopes = "links:create,analytics:read,admin:write",
            IsActive = true
        });
        db.SaveChanges();
    }
}

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LinkLift API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseRateLimiter();
app.UseMiddleware<ApiKeyAuthMiddleware>();

// Health Check
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));

// -------------------------------------------------------------
// SHORT LINKS ENDPOINTS
// -------------------------------------------------------------
var linksApi = app.MapGroup("/api/links").WithTags("Links");

linksApi.MapPost("/", async (
    [FromBody] CreateShortLinkRequest request,
    [FromServices] IShortLinkService shortLinkService,
    HttpContext httpContext) =>
{
    var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
    var response = await shortLinkService.CreateAsync(request, baseUrl, httpContext.RequestAborted);
    return Results.Created($"/api/links/{response.Id}", response);
})
.RequireRateLimiting("shorten_policy")
.WithMetadata(new RequireApiKeyAttribute("links:create"));

linksApi.MapGet("/", async (
    [FromQuery] string? tag,
    [FromQuery] string? domain,
    [FromQuery] string? search,
    [FromServices] IShortLinkService shortLinkService,
    HttpContext httpContext) =>
{
    var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
    var list = await shortLinkService.ListAsync(tag, domain, search, baseUrl, httpContext.RequestAborted);
    return Results.Ok(list);
});

linksApi.MapGet("/{id:long}", async (
    long id,
    [FromServices] IShortLinkService shortLinkService,
    HttpContext httpContext) =>
{
    var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
    var link = await shortLinkService.GetByIdAsync(id, baseUrl, httpContext.RequestAborted);
    return link != null ? Results.Ok(link) : Results.NotFound();
});

linksApi.MapDelete("/{id:long}", async (
    long id,
    [FromServices] IShortLinkService shortLinkService,
    CancellationToken ct) =>
{
    var deleted = await shortLinkService.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

linksApi.MapPost("/bulk", async (
    [FromBody] BulkShortenRequest request,
    [FromServices] IShortLinkService shortLinkService,
    HttpContext httpContext) =>
{
    var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
    var response = await shortLinkService.ProcessBulkAsync(request, baseUrl, httpContext.RequestAborted);
    return Results.Ok(response);
})
.RequireRateLimiting("shorten_policy")
.WithMetadata(new RequireApiKeyAttribute("links:create"));

// -------------------------------------------------------------
// ANALYTICS ENDPOINTS
// -------------------------------------------------------------
var analyticsApi = app.MapGroup("/api/analytics").WithTags("Analytics");

analyticsApi.MapGet("/link/{id:long}", async (
    long id,
    [FromServices] IAnalyticsService analyticsService,
    CancellationToken ct) =>
{
    var summary = await analyticsService.GetSummaryAsync(id, ct);
    return summary != null ? Results.Ok(summary) : Results.NotFound();
})
.WithMetadata(new RequireApiKeyAttribute("analytics:read"));

analyticsApi.MapGet("/slug/{slug}", async (
    string slug,
    [FromServices] IAnalyticsService analyticsService,
    CancellationToken ct) =>
{
    var summary = await analyticsService.GetSummaryBySlugAsync(slug, ct);
    return summary != null ? Results.Ok(summary) : Results.NotFound();
})
.WithMetadata(new RequireApiKeyAttribute("analytics:read"));

// -------------------------------------------------------------
// DOMAIN MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
var domainsApi = app.MapGroup("/api/domains").WithTags("Domains");

domainsApi.MapPost("/", async (
    [FromBody] CreateDomainMappingRequest request,
    [FromServices] IDomainService domainService,
    CancellationToken ct) =>
{
    var domain = await domainService.CreateAsync(request, ct);
    return Results.Created($"/api/domains/{domain.Id}", domain);
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

domainsApi.MapGet("/", async (
    [FromServices] IDomainService domainService,
    CancellationToken ct) =>
{
    var domains = await domainService.ListAsync(ct);
    return Results.Ok(domains);
});

domainsApi.MapDelete("/{id:long}", async (
    long id,
    [FromServices] IDomainService domainService,
    CancellationToken ct) =>
{
    var deleted = await domainService.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

// -------------------------------------------------------------
// API KEY MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
var keysApi = app.MapGroup("/api/keys").WithTags("ApiKeys");

keysApi.MapPost("/", async (
    [FromBody] CreateApiKeyRequest request,
    [FromServices] IApiKeyService apiKeyService,
    CancellationToken ct) =>
{
    var key = await apiKeyService.CreateAsync(request, ct);
    return Results.Created($"/api/keys/{key.Id}", key);
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

keysApi.MapGet("/", async (
    [FromServices] IApiKeyService apiKeyService,
    CancellationToken ct) =>
{
    var keys = await apiKeyService.ListAsync(ct);
    return Results.Ok(keys);
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

keysApi.MapDelete("/{id:long}", async (
    long id,
    [FromServices] IApiKeyService apiKeyService,
    CancellationToken ct) =>
{
    var revoked = await apiKeyService.RevokeAsync(id, ct);
    return revoked ? Results.NoContent() : Results.NotFound();
})
.WithMetadata(new RequireApiKeyAttribute("admin:write"));

// -------------------------------------------------------------
// SIGNALR REAL-TIME HUB
// -------------------------------------------------------------
app.MapHub<AnalyticsHub>("/hub/analytics");

// -------------------------------------------------------------
// HIGH-PERFORMANCE REDIRECTION ENGINE (<5ms cached)
// -------------------------------------------------------------
app.MapGet("/{slug}", async (
    string slug,
    [FromServices] ICacheService cacheService,
    [FromServices] IShortLinkRepository shortLinkRepo,
    [FromServices] IRedirectionEngine redirectionEngine,
    [FromServices] IBotDetectionService botDetector,
    [FromServices] IDeviceDetector deviceDetector,
    [FromServices] IGeoLookupService geoService,
    [FromServices] IClickTelemetryQueue telemetryQueue,
    HttpContext context) =>
{
    var host = context.Request.Host.Host;
    var userAgent = context.Request.Headers.UserAgent.ToString();
    var ipAddress = context.Connection.RemoteIpAddress?.ToString();

    // 1. Try Cache First for sub-millisecond redirect
    var link = await cacheService.GetShortLinkAsync(slug, host, context.RequestAborted);
    if (link == null)
    {
        // Fallback to database
        var entity = await shortLinkRepo.GetBySlugWithDetailsAsync(slug, host, context.RequestAborted);
        if (entity == null && host != "localhost" && host != "127.0.0.1")
        {
            // Try apex if domain specific not found
            entity = await shortLinkRepo.GetBySlugWithDetailsAsync(slug, null, context.RequestAborted);
        }

        if (entity != null)
        {
            link = new CachedShortLink(
                Id: entity.Id,
                Slug: entity.Slug,
                OriginalUrl: entity.OriginalUrl,
                RedirectType: entity.RedirectType,
                IsActive: entity.IsActive,
                DomainHostname: entity.DomainMapping?.Hostname,
                ExpiresAtUtc: entity.ExpiresAtUtc,
                MaxClicks: entity.MaxClicks,
                ClickCount: entity.ClickCount,
                Rules: entity.Rules.Select(r => new CachedRule(r.Type, r.MatchValue, r.TargetUrl, r.Priority)).ToList()
            );

            await cacheService.SetShortLinkAsync(slug, host, link, TimeSpan.FromHours(24), context.RequestAborted);
        }
    }

    if (link == null)
    {
        return Results.NotFound(new { message = $"Short link '/{slug}' not found." });
    }

    // 2. Detection (Device, OS, Browser, Country, Bot)
    var deviceResult = deviceDetector.Detect(userAgent);
    var countryCode = geoService.ResolveCountryCode(ipAddress);
    var botCheck = botDetector.Evaluate(userAgent, ipAddress, DateTime.UtcNow, slug);

    // 3. Redirection Engine (evaluates dynamic geo/device rules and expiration)
    var eval = redirectionEngine.Evaluate(link, countryCode, deviceResult.DeviceType, deviceResult.OperatingSystem);
    if (eval.IsExpiredOrDeactivated)
    {
        return Results.StatusCode(StatusCodes.Status410Gone);
    }

    // 4. Non-blocking asynchronous telemetry enqueue
    var telemetry = new ClickTelemetry
    {
        ShortLinkId = link.Id,
        DestinationUrl = eval.TargetUrl,
        ClickedAtUtc = DateTime.UtcNow,
        Referrer = context.Request.Headers.Referer.ToString(),
        UserAgent = userAgent,
        DeviceType = deviceResult.DeviceType,
        OperatingSystem = deviceResult.OperatingSystem,
        Browser = deviceResult.Browser,
        CountryCode = countryCode,
        HashedIpAddress = AnonymizationHelper.AnonymizeAndHashIp(ipAddress),
        IsBot = botCheck.IsBot,
        BotReason = botCheck.Reason
    };

    await telemetryQueue.EnqueueAsync(telemetry);

    // 5. Execute Redirect
    return eval.RedirectType switch
    {
        LinkLift.Domain.Enums.RedirectType.Permanent => Results.Redirect(eval.TargetUrl, permanent: true),
        LinkLift.Domain.Enums.RedirectType.TemporaryRedirect => Results.StatusCode(StatusCodes.Status307TemporaryRedirect),
        _ => Results.Redirect(eval.TargetUrl, permanent: false)
    };
});

app.Run();
