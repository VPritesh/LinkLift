using LinkLift.Domain.Enums;

namespace LinkLift.Application.DTOs;

public record CreateShortLinkRequest(
    string OriginalUrl,
    string? CustomSlug = null,
    string? Title = null,
    string? Description = null,
    RedirectType RedirectType = RedirectType.Found,
    string? DomainHostname = null,
    DateTime? ExpiresAtUtc = null,
    long? MaxClicks = null,
    List<string>? Tags = null,
    List<CreateShortLinkRuleDto>? Rules = null
);

public record CreateShortLinkRuleDto(
    int RuleType, // 1: Country, 2: Device, 3: OperatingSystem
    string MatchValue,
    string TargetUrl,
    int Priority = 0
);

public record ShortLinkResponse(
    long Id,
    string Slug,
    string OriginalUrl,
    string ShortUrl,
    string? Title,
    string? Description,
    RedirectType RedirectType,
    bool IsActive,
    string? DomainHostname,
    DateTime? ExpiresAtUtc,
    long? MaxClicks,
    long ClickCount,
    DateTime CreatedAtUtc,
    List<string> Tags,
    List<ShortLinkRuleDto> Rules
);

public record ShortLinkRuleDto(
    long Id,
    int RuleType,
    string MatchValue,
    string TargetUrl,
    int Priority
);

public record BulkShortenItemRequest(
    string OriginalUrl,
    string? CustomSlug = null,
    string? Title = null
);

public record BulkShortenRequest(
    List<BulkShortenItemRequest> Links
);

public record BulkShortenResultItem(
    string OriginalUrl,
    string? ShortUrl,
    string? Slug,
    bool Success,
    string? ErrorMessage
);

public record BulkShortenResponse(
    int TotalProcessed,
    int SuccessCount,
    int FailureCount,
    List<BulkShortenResultItem> Results
);

