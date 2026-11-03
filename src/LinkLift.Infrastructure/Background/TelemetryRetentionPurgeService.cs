using LinkLift.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LinkLift.Infrastructure.Background;

public class TelemetryRetentionPurgeService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TelemetryRetentionPurgeService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(12);

    public TelemetryRetentionPurgeService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<TelemetryRetentionPurgeService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TelemetryRetentionPurgeService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var retentionDaysStr = _configuration["DataRetention:RetentionDays"] ?? "180";
                if (int.TryParse(retentionDaysStr, out var retentionDays) && retentionDays > 0)
                {
                    await PurgeExpiredTelemetryAsync(retentionDays, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing telemetry retention purge.");
            }

            // Wait 12 hours between purge passes
            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task PurgeExpiredTelemetryAsync(int retentionDays, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LinkLiftDbContext>();

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
        _logger.LogInformation("Running GDPR data retention purge for records older than {Cutoff} ({Days} days).", cutoffDate, retentionDays);

        var expiredRecords = await db.ClickTelemetries
            .Where(t => t.ClickedAtUtc < cutoffDate)
            .Take(5000) // Batch delete for optimal memory and lock management
            .ToListAsync(cancellationToken);

        if (expiredRecords.Count > 0)
        {
            db.ClickTelemetries.RemoveRange(expiredRecords);
            await db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Successfully purged {Count} expired telemetry records under GDPR retention policy.", expiredRecords.Count);
        }
    }
}

