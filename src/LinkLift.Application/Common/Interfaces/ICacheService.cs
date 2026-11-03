using LinkLift.Application.Common.Models;

namespace LinkLift.Application.Common.Interfaces;

public interface ICacheService
{
    Task<CachedShortLink?> GetShortLinkAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default);
    Task SetShortLinkAsync(string slug, string? hostname, CachedShortLink link, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task InvalidateShortLinkAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default);
}

