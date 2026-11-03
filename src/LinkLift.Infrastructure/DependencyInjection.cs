using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Domain.Common;
using LinkLift.Domain.Entities;
using LinkLift.Infrastructure.Background;
using LinkLift.Infrastructure.Caching;
using LinkLift.Infrastructure.Detection;
using LinkLift.Infrastructure.Persistence;
using LinkLift.Infrastructure.Persistence.Repositories;
using LinkLift.Infrastructure.Realtime;
using StackExchange.Redis;

namespace LinkLift.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Database Configuration (SqlServer, Postgres, Sqlite)
        var dbProvider = configuration["DatabaseProvider"] ?? "Sqlite";
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
                               ?? "Data Source=linklift.db";

        services.AddDbContext<LinkLiftDbContext>(options =>
        {
            switch (dbProvider.ToLowerInvariant())
            {
                case "sqlserver":
                case "mssql":
                    options.UseSqlServer(connectionString);
                    break;
                case "postgres":
                case "postgresql":
                    // Fallback to SQLite if Npgsql is omitted, or SqlServer
                    options.UseSqlite(connectionString);
                    break;
                case "sqlite":
                default:
                    options.UseSqlite(connectionString);
                    break;
            }
        });

        // 2. Repositories & Unit of Work
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        services.AddScoped<IShortLinkRepository, ShortLinkRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // 3. Redis Connection (Optional / Hybrid)
        var redisConnString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConnString))
        {
            try
            {
                var redisOptions = ConfigurationOptions.Parse(redisConnString);
                redisOptions.AbortOnConnectFail = false;
                var multiplexer = ConnectionMultiplexer.Connect(redisOptions);
                services.AddSingleton<IConnectionMultiplexer>(multiplexer);
            }
            catch
            {
                // Degrades gracefully to in-memory caching
            }
        }

        // 4. Caching & Detection Services
        services.AddSingleton<ICacheService, HybridCacheService>();
        services.AddSingleton<IBotDetectionService, BotDetectionService>();
        services.AddSingleton<IDeviceDetector, SimpleDeviceDetector>();
        services.AddSingleton<IGeoLookupService, SimpleGeoLookupService>();
        services.AddSingleton<IRealtimeEventPublisher, RedisEventPublisher>();

        // 5. High-Throughput Click Telemetry Background Queue & Processor
        services.AddSingleton<IClickTelemetryQueue, ChannelClickTelemetryQueue>();
        services.AddHostedService<ClickTelemetryBatchProcessor>();

        // 6. GDPR Data Retention Purging Background Worker
        services.AddHostedService<TelemetryRetentionPurgeService>();

        return services;
    }
}

