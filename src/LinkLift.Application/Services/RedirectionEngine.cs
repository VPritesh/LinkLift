using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using LinkLift.Domain.Entities;
using LinkLift.Domain.Enums;

namespace LinkLift.Application.Services;

public record RedirectionEvaluationResult(
    string TargetUrl,
    RedirectType RedirectType,
    long ShortLinkId,
    bool IsExpiredOrDeactivated
);

public interface IRedirectionEngine
{
    RedirectionEvaluationResult Evaluate(
        CachedShortLink link,
        string? countryCode,
        DeviceType deviceType,
        string? operatingSystem);
}

public class RedirectionEngine : IRedirectionEngine
{
    public RedirectionEvaluationResult Evaluate(
        CachedShortLink link,
        string? countryCode,
        DeviceType deviceType,
        string? operatingSystem)
    {
        // 1. Check expiration & active status
        if (!link.IsActive)
        {
            return new RedirectionEvaluationResult(string.Empty, link.RedirectType, link.Id, true);
        }

        if (link.ExpiresAtUtc.HasValue && link.ExpiresAtUtc.Value <= DateTime.UtcNow)
        {
            return new RedirectionEvaluationResult(string.Empty, link.RedirectType, link.Id, true);
        }

        if (link.MaxClicks.HasValue && link.ClickCount >= link.MaxClicks.Value)
        {
            return new RedirectionEvaluationResult(string.Empty, link.RedirectType, link.Id, true);
        }

        // 2. Evaluate Dynamic Rules (sorted by priority)
        var orderedRules = link.Rules.OrderBy(r => r.Priority).ToList();

        foreach (var rule in orderedRules)
        {
            if (rule.Type == RuleType.Country && !string.IsNullOrWhiteSpace(countryCode))
            {
                if (string.Equals(rule.MatchValue, countryCode, StringComparison.OrdinalIgnoreCase))
                {
                    return new RedirectionEvaluationResult(rule.TargetUrl, link.RedirectType, link.Id, false);
                }
            }
            else if (rule.Type == RuleType.Device)
            {
                if (string.Equals(rule.MatchValue, deviceType.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    return new RedirectionEvaluationResult(rule.TargetUrl, link.RedirectType, link.Id, false);
                }
            }
            else if (rule.Type == RuleType.OperatingSystem && !string.IsNullOrWhiteSpace(operatingSystem))
            {
                if (string.Equals(rule.MatchValue, operatingSystem, StringComparison.OrdinalIgnoreCase))
                {
                    return new RedirectionEvaluationResult(rule.TargetUrl, link.RedirectType, link.Id, false);
                }
            }
        }

        // 3. Fallback to original url
        return new RedirectionEvaluationResult(link.OriginalUrl, link.RedirectType, link.Id, false);
    }
}

