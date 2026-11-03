using System.Collections.Concurrent;
using System.Text.Json;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace LinkLift.Infrastructure.Caching;

public class HybridCacheService : ICacheService
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<HybridCacheService> _logger;
    private readonly ConcurrentDictionary<string, (CachedShortLink Link, DateTime ExpiresAt)> _memoryFallback = new();

    public HybridCacheService(ILogger<HybridCacheService> logger, IConnectionMultiplexer? redis = null)
    {
        _logger = logger;
        _redis = redis;
    }

    public async Task<CachedShortLink?> GetShortLinkAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default)
    {
        var key = BuildCacheKey(slug, hostname);

        if (_redis != null && _redis.IsConnected)
        {
            try
            {
                var db = _redis.GetDatabase();
                var value = await db.StringGetAsync(key);
                if (value.HasValue)
                {
                    return JsonSerializer.Deserialize<CachedShortLink>((string)value!);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read key {Key} from Redis. Falling back to memory.", key);
            }
        }

        if (_memoryFallback.TryGetValue(key, out var entry))
        {
            if (entry.ExpiresAt > DateTime.UtcNow)
            {
                return entry.Link;
            }
            _memoryFallback.TryRemove(key, out _);
        }

        return null;
    }

    public async Task SetShortLinkAsync(string slug, string? hostname, CachedShortLink link, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var key = BuildCacheKey(slug, hostname);
        var expiry = expiration ?? TimeSpan.FromHours(24);

        if (_redis != null && _redis.IsConnected)
        {
            try
            {
                var db = _redis.GetDatabase();
                var json = JsonSerializer.Serialize(link);
                await db.StringSetAsync(key, json, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write key {Key} to Redis. Storing in memory fallback.", key);
            }
        }

        _memoryFallback[key] = (link, DateTime.UtcNow.Add(expiry));
    }

    public async Task InvalidateShortLinkAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default)
    {
        var key = BuildCacheKey(slug, hostname);

        if (_redis != null && _redis.IsConnected)
        {
            try
            {
                var db = _redis.GetDatabase();
                await db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to invalidate key {Key} in Redis.", key);
            }
        }

        _memoryFallback.TryRemove(key, out _);
    }

    private static string BuildCacheKey(string slug, string? hostname)
    {
        var host = string.IsNullOrWhiteSpace(hostname) ? "default" : hostname.Trim().ToLowerInvariant();
        return $"linklift:link:{host}:{slug.Trim().ToLowerInvariant()}";
    }
}

