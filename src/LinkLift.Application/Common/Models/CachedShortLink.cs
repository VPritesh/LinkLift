using LinkLift.Domain.Entities;
using LinkLift.Domain.Enums;

namespace LinkLift.Application.Common.Models;

public record CachedShortLink(
    long Id,
    string Slug,
    string OriginalUrl,
    RedirectType RedirectType,
    bool IsActive,
    string? DomainHostname,
    DateTime? ExpiresAtUtc,
    long? MaxClicks,
    long ClickCount,
    IReadOnlyList<CachedRule> Rules
);

public record CachedRule(
    RuleType Type,
    string MatchValue,
    string TargetUrl,
    int Priority
);

