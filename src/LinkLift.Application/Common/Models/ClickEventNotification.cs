using LinkLift.Domain.Enums;

namespace LinkLift.Application.Common.Models;

public record ClickEventNotification(
    long ShortLinkId,
    string Slug,
    string DestinationUrl,
    DateTime ClickedAtUtc,
    string? Referrer,
    DeviceType DeviceType,
    string? OperatingSystem,
    string? Browser,
    string? CountryCode,
    bool IsBot
);

