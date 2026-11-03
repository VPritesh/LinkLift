using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using LinkLift.Domain.Entities;
using LinkLift.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LinkLift.Infrastructure.Background;

public class ClickTelemetryBatchProcessor : BackgroundService
{
    private readonly IClickTelemetryQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly IRealtimeEventPublisher _realtimePublisher;
    private readonly ILogger<ClickTelemetryBatchProcessor> _logger;

    private const int BatchSize = 100;
    private readonly TimeSpan _flushInterval = TimeSpan.FromSeconds(2);

    public ClickTelemetryBatchProcessor(
        IClickTelemetryQueue queue,
        IServiceProvider serviceProvider,
        IRealtimeEventPublisher realtimePublisher,
        ILogger<ClickTelemetryBatchProcessor> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _realtimePublisher = realtimePublisher;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ClickTelemetryBatchProcessor started.");

        var batch = new List<ClickTelemetry>(BatchSize);
        var lastFlush = DateTime.UtcNow;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await foreach (var telemetry in _queue.ReadAllAsync(stoppingToken))
                {
                    batch.Add(telemetry);

                    // Publish real-time event
                    _ = _realtimePublisher.PublishClickEventAsync(new ClickEventNotification(
                        ShortLinkId: telemetry.ShortLinkId,
                        Slug: telemetry.ShortLink?.Slug ?? string.Empty,
                        DestinationUrl: telemetry.DestinationUrl,
                        ClickedAtUtc: telemetry.ClickedAtUtc,
                        Referrer: telemetry.Referrer,
                        DeviceType: telemetry.DeviceType,
                        OperatingSystem: telemetry.OperatingSystem,
                        Browser: telemetry.Browser,
                        CountryCode: telemetry.CountryCode,
                        IsBot: telemetry.IsBot
                    ), stoppingToken);

                    if (batch.Count >= BatchSize || DateTime.UtcNow - lastFlush >= _flushInterval)
                    {
                        await FlushBatchAsync(batch, stoppingToken);
                        lastFlush = DateTime.UtcNow;
                    }
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing click telemetry batch.");
                await Task.Delay(1000, stoppingToken);
            }
        }

        // Flush any remaining
        if (batch.Count > 0)
        {
            await FlushBatchAsync(batch, CancellationToken.None);
        }
    }

    private async Task FlushBatchAsync(List<ClickTelemetry> batch, CancellationToken cancellationToken)
    {
        if (batch.Count == 0) return;

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<LinkLiftDbContext>();

        try
        {
            await dbContext.ClickTelemetries.AddRangeAsync(batch, cancellationToken);

            // Increment ClickCount per link
            var clicksPerLink = batch.GroupBy(b => b.ShortLinkId);
            foreach (var group in clicksPerLink)
            {
                var link = await dbContext.ShortLinks.FindAsync(new object[] { group.Key }, cancellationToken);
                if (link != null)
                {
                    link.ClickCount += group.Count();
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogDebug("Flushed {Count} telemetry records to database.", batch.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to flush telemetry batch to database.");
        }
        finally
        {
            batch.Clear();
        }
    }
}

