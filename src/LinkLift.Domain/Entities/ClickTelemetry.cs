using LinkLift.Domain.Common;
using LinkLift.Domain.Enums;

namespace LinkLift.Domain.Entities;

public class ClickTelemetry : BaseEntity
{
    public long ShortLinkId { get; set; }
    public ShortLink ShortLink { get; set; } = null!;

    public DateTime ClickedAtUtc { get; set; } = DateTime.UtcNow;
    public string? Referrer { get; set; }
    public string? UserAgent { get; set; }
    public DeviceType DeviceType { get; set; } = DeviceType.Unknown;
    public string? OperatingSystem { get; set; }
    public string? Browser { get; set; }
    public string? CountryCode { get; set; }
    public string? HashedIpAddress { get; set; }
    public bool IsBot { get; set; }
    public string? BotReason { get; set; }
    public string DestinationUrl { get; set; } = string.Empty;
}

