using LinkLift.Domain.Common;

namespace LinkLift.Domain.Entities;

public class DomainMapping : BaseEntity
{
    public string Hostname { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? CustomNotFoundUrl { get; set; }
    public string? Description { get; set; }

    public ICollection<ShortLink> Links { get; set; } = new List<ShortLink>();
}

