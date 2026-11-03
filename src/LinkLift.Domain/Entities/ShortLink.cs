using LinkLift.Domain.Common;
using LinkLift.Domain.Enums;

namespace LinkLift.Domain.Entities;

public class ShortLink : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string OriginalUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public RedirectType RedirectType { get; set; } = RedirectType.Found;
    public bool IsActive { get; set; } = true;

    public long? DomainMappingId { get; set; }
    public DomainMapping? DomainMapping { get; set; }

    public DateTime? ExpiresAtUtc { get; set; }
    public long? MaxClicks { get; set; }
    public long ClickCount { get; set; }

    public ICollection<ShortLinkRule> Rules { get; set; } = new List<ShortLinkRule>();
    public ICollection<ShortLinkTag> Tags { get; set; } = new List<ShortLinkTag>();
    public ICollection<ClickTelemetry> Telemetry { get; set; } = new List<ClickTelemetry>();
}

