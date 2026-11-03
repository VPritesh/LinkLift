using LinkLift.Domain.Common;

namespace LinkLift.Domain.Entities;

public class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ColorHex { get; set; }

    public ICollection<ShortLinkTag> ShortLinks { get; set; } = new List<ShortLinkTag>();
}

public class ShortLinkTag
{
    public long ShortLinkId { get; set; }
    public ShortLink ShortLink { get; set; } = null!;

    public long TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}

