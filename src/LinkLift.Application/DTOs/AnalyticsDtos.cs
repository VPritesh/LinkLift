using LinkLift.Domain.Enums;

namespace LinkLift.Application.DTOs;

public record LinkAnalyticsSummaryDto(
    long ShortLinkId,
    string Slug,
    long TotalClicks,
    long RealClicks,
    long BotClicks,
    Dictionary<string, int> ClicksByCountry,
    Dictionary<string, int> ClicksByDevice,
    Dictionary<string, int> ClicksByBrowser,
    Dictionary<string, int> ClicksByOs,
    Dictionary<string, int> ClicksByReferrer,
    List<ClickItemDto> RecentClicks
);

public record ClickItemDto(
    DateTime ClickedAtUtc,
    string? CountryCode,
    DeviceType DeviceType,
    string? OperatingSystem,
    string? Browser,
    string? Referrer,
    bool IsBot,
    string? BotReason
);

