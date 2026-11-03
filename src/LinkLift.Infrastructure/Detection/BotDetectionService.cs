using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using LinkLift.Application.Common.Interfaces;

namespace LinkLift.Infrastructure.Detection;

public class BotDetectionService : IBotDetectionService
{
    // Common scraper and crawler signatures
    private static readonly string[] BotKeywords = new[]
    {
        "bot", "crawler", "spider", "slurp", "facebookexternalhit", "whatsapp",
        "slackbot", "twitterbot", "telegrambot", "discordbot", "curl", "wget",
        "python-requests", "postman", "go-http-client", "apache-httpclient",
        "googlebot", "bingbot", "yandexbot", "baiduspider", "duckduckbot"
    };

    // Rapid-click tracking (3-second rule): Key: IP_Slug, Value: Timestamp
    private readonly ConcurrentDictionary<string, DateTime> _rapidClickCache = new();

    public BotCheckResult Evaluate(string? userAgent, string? ipAddress, DateTime requestTimeUtc, string slug)
    {
        // 1. Empty user agent
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return new BotCheckResult(true, "Missing User-Agent header");
        }

        var lowerUa = userAgent.ToLowerInvariant();

        // 2. Keyword check
        foreach (var keyword in BotKeywords)
        {
            if (lowerUa.Contains(keyword))
            {
                return new BotCheckResult(true, $"Identified bot keyword: {keyword}");
            }
        }

        // 3. 3-Second Rapid Click Rule (same IP clicking the same short slug within 3 seconds)
        if (!string.IsNullOrWhiteSpace(ipAddress))
        {
            var cacheKey = $"{ipAddress}_{slug.ToLowerInvariant()}";
            if (_rapidClickCache.TryGetValue(cacheKey, out var lastClickTime))
            {
                var diff = (requestTimeUtc - lastClickTime).TotalSeconds;
                _rapidClickCache[cacheKey] = requestTimeUtc;

                if (diff >= 0 && diff < 3.0)
                {
                    return new BotCheckResult(true, "Rapid consecutive click within 3 seconds");
                }
            }
            else
            {
                _rapidClickCache[cacheKey] = requestTimeUtc;
            }
        }

        return new BotCheckResult(false, null);
    }
}

