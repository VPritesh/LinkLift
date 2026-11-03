using LinkLift.Domain.Common;

namespace LinkLift.Domain.Entities;

public enum RuleType
{
    Country = 1,
    Device = 2,
    OperatingSystem = 3
}

public class ShortLinkRule : BaseEntity
{
    public long ShortLinkId { get; set; }
    public ShortLink ShortLink { get; set; } = null!;

    public RuleType Type { get; set; }
    public string MatchValue { get; set; } = string.Empty; // e.g., "US", "iOS", "Android", "Windows"
    public string TargetUrl { get; set; } = string.Empty;
    public int Priority { get; set; } = 0;
}

