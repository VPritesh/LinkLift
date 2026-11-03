using System.Text.Json;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace LinkLift.Infrastructure.Realtime;

public class RedisEventPublisher : IRealtimeEventPublisher
{
    private static readonly RedisChannel EventChannel = RedisChannel.Literal("linklift:events:clicks");
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<RedisEventPublisher> _logger;

    public RedisEventPublisher(ILogger<RedisEventPublisher> logger, IConnectionMultiplexer? redis = null)
    {
        _logger = logger;
        _redis = redis;
    }

    public async Task PublishClickEventAsync(ClickEventNotification notification, CancellationToken cancellationToken = default)
    {
        if (_redis != null && _redis.IsConnected)
        {
            try
            {
                var subscriber = _redis.GetSubscriber();
                var json = JsonSerializer.Serialize(notification);
                await subscriber.PublishAsync(EventChannel, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to publish click event to Redis PubSub.");
            }
        }
    }
}
