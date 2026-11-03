using System.Text.Json;
using LinkLift.Api.Hubs;
using LinkLift.Application.Common.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace LinkLift.Api.Services;

public class RedisSignalRBridgeService : BackgroundService
{
    private const string ChannelName = "linklift:events:clicks";
    private readonly IConnectionMultiplexer? _redis;
    private readonly IHubContext<AnalyticsHub, IAnalyticsClient> _hubContext;
    private readonly ILogger<RedisSignalRBridgeService> _logger;

    public RedisSignalRBridgeService(
        IHubContext<AnalyticsHub, IAnalyticsClient> hubContext,
        ILogger<RedisSignalRBridgeService> logger,
        IConnectionMultiplexer? redis = null)
    {
        _hubContext = hubContext;
        _logger = logger;
        _redis = redis;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_redis == null || !_redis.IsConnected)
        {
            _logger.LogInformation("Redis not connected. Redis-to-SignalR bridge is in standalone mode.");
            return;
        }

        try
        {
            var sub = _redis.GetSubscriber();
            await sub.SubscribeAsync(ChannelName, async (channel, message) =>
            {
                try
                {
                    var notification = JsonSerializer.Deserialize<ClickEventNotification>((string)message!);
                    if (notification != null)
                    {
                        // Broadcast globally to dashboard and specifically to link-specific group
                        await _hubContext.Clients.All.ReceiveClickEvent(notification);
                        await _hubContext.Clients.Group($"link_{notification.Slug.ToLowerInvariant()}").ReceiveClickEvent(notification);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error relaying Redis pub/sub to SignalR.");
                }
            });

            // Keep background service alive
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(5000, stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RedisSignalRBridge encountered an error.");
        }
    }
}

