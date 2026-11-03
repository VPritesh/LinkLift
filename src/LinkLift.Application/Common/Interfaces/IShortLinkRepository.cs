using LinkLift.Domain.Entities;

namespace LinkLift.Application.Common.Interfaces;

public interface IShortLinkRepository : IRepository<ShortLink>
{
    Task<ShortLink?> GetBySlugWithDetailsAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default);
    Task<bool> IsSlugTakenAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default);
    Task IncrementClickCountAsync(long shortLinkId, CancellationToken cancellationToken = default);
}

