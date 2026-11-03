using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.Common.Models;
using LinkLift.Application.DTOs;
using LinkLift.Domain.Entities;
using LinkLift.Domain.Enums;
using LinkLift.Domain.Utilities;

namespace LinkLift.Application.Services;

public interface IShortLinkService
{
    Task<ShortLinkResponse> CreateAsync(CreateShortLinkRequest request, string baseUrl, CancellationToken cancellationToken = default);
    Task<ShortLinkResponse?> GetByIdAsync(long id, string baseUrl, CancellationToken cancellationToken = default);
    Task<ShortLinkResponse?> GetBySlugAsync(string slug, string? hostname, string baseUrl, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ShortLinkResponse>> ListAsync(string? tag, string? hostname, string? search, string baseUrl, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<BulkShortenResponse> ProcessBulkAsync(BulkShortenRequest request, string baseUrl, CancellationToken cancellationToken = default);
}

public class ShortLinkService : IShortLinkService
{
    private readonly IShortLinkRepository _shortLinkRepo;
    private readonly IRepository<DomainMapping> _domainRepo;
    private readonly IRepository<Tag> _tagRepo;
    private readonly ICacheService _cacheService;
    private readonly IUnitOfWork _unitOfWork;

    public ShortLinkService(
        IShortLinkRepository shortLinkRepo,
        IRepository<DomainMapping> domainRepo,
        IRepository<Tag> tagRepo,
        ICacheService cacheService,
        IUnitOfWork unitOfWork)
    {
        _shortLinkRepo = shortLinkRepo;
        _domainRepo = domainRepo;
        _tagRepo = tagRepo;
        _cacheService = cacheService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ShortLinkResponse> CreateAsync(CreateShortLinkRequest request, string baseUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginalUrl))
            throw new ArgumentException("Original URL is required.", nameof(request.OriginalUrl));

        if (!Uri.TryCreate(request.OriginalUrl, UriKind.Absolute, out _))
            throw new ArgumentException("Original URL is not a valid absolute URL.", nameof(request.OriginalUrl));

        DomainMapping? domainMapping = null;
        if (!string.IsNullOrWhiteSpace(request.DomainHostname))
        {
            var domains = await _domainRepo.ListAsync(d => d.Hostname.ToLower() == request.DomainHostname.ToLower().Trim(), cancellationToken);
            domainMapping = domains.FirstOrDefault();
            if (domainMapping == null)
            {
                throw new InvalidOperationException($"Domain '{request.DomainHostname}' is not configured.");
            }
        }

        string slug;
        if (!string.IsNullOrWhiteSpace(request.CustomSlug))
        {
            var candidate = request.CustomSlug.Trim();
            if (ReservedKeywords.IsReserved(candidate))
                throw new InvalidOperationException($"Slug '{candidate}' is a reserved system keyword.");

            var isTaken = await _shortLinkRepo.IsSlugTakenAsync(candidate, domainMapping?.Hostname, cancellationToken);
            if (isTaken)
                throw new InvalidOperationException($"Slug '{candidate}' is already taken.");

            slug = candidate;
        }
        else
        {
            // Auto-generate placeholder; will update with Base62 of Id after saving or generate pseudo-random
            slug = Guid.NewGuid().ToString("N")[..7];
        }

        var shortLink = new ShortLink
        {
            OriginalUrl = request.OriginalUrl.Trim(),
            Slug = slug,
            Title = request.Title,
            Description = request.Description,
            RedirectType = request.RedirectType,
            DomainMappingId = domainMapping?.Id,
            DomainMapping = domainMapping,
            ExpiresAtUtc = request.ExpiresAtUtc,
            MaxClicks = request.MaxClicks,
            IsActive = true
        };

        if (request.Rules != null && request.Rules.Any())
        {
            foreach (var rule in request.Rules)
            {
                shortLink.Rules.Add(new ShortLinkRule
                {
                    Type = (RuleType)rule.RuleType,
                    MatchValue = rule.MatchValue.Trim(),
                    TargetUrl = rule.TargetUrl.Trim(),
                    Priority = rule.Priority
                });
            }
        }

        if (request.Tags != null && request.Tags.Any())
        {
            foreach (var tagName in request.Tags.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                var cleanTag = tagName.Trim();
                var existingTags = await _tagRepo.ListAsync(t => t.Name.ToLower() == cleanTag.ToLower(), cancellationToken);
                var tag = existingTags.FirstOrDefault() ?? new Tag { Name = cleanTag };
                shortLink.Tags.Add(new ShortLinkTag { Tag = tag, ShortLink = shortLink });
            }
        }

        await _shortLinkRepo.AddAsync(shortLink, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        // If no custom slug was specified, generate deterministic Base62 from the auto-increment ID
        if (string.IsNullOrWhiteSpace(request.CustomSlug))
        {
            var base62Slug = Base62Encoder.Encode(shortLink.Id);
            shortLink.Slug = base62Slug;
            await _shortLinkRepo.UpdateAsync(shortLink, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
        }

        // Cache the newly created link
        await CacheLinkAsync(shortLink, cancellationToken);

        return MapToResponse(shortLink, baseUrl);
    }

    public async Task<ShortLinkResponse?> GetByIdAsync(long id, string baseUrl, CancellationToken cancellationToken = default)
    {
        var link = await _shortLinkRepo.GetByIdAsync(id, cancellationToken);
        return link == null ? null : MapToResponse(link, baseUrl);
    }

    public async Task<ShortLinkResponse?> GetBySlugAsync(string slug, string? hostname, string baseUrl, CancellationToken cancellationToken = default)
    {
        var link = await _shortLinkRepo.GetBySlugWithDetailsAsync(slug, hostname, cancellationToken);
        return link == null ? null : MapToResponse(link, baseUrl);
    }

    public async Task<IReadOnlyList<ShortLinkResponse>> ListAsync(string? tag, string? hostname, string? search, string baseUrl, CancellationToken cancellationToken = default)
    {
        var all = await _shortLinkRepo.ListAsync(null, cancellationToken);
        var filtered = all.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(tag))
        {
            filtered = filtered.Where(l => l.Tags.Any(t => string.Equals(t.Tag.Name, tag, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(hostname))
        {
            filtered = filtered.Where(l => l.DomainMapping != null && string.Equals(l.DomainMapping.Hostname, hostname, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            filtered = filtered.Where(l =>
                l.Slug.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                l.OriginalUrl.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                (l.Title != null && l.Title.Contains(s, StringComparison.OrdinalIgnoreCase)));
        }

        return filtered
            .OrderByDescending(l => l.CreatedAtUtc)
            .Select(l => MapToResponse(l, baseUrl))
            .ToList();
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var link = await _shortLinkRepo.GetByIdAsync(id, cancellationToken);
        if (link == null) return false;

        await _shortLinkRepo.DeleteAsync(link, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);
        await _cacheService.InvalidateShortLinkAsync(link.Slug, link.DomainMapping?.Hostname, cancellationToken);
        return true;
    }

    public async Task<BulkShortenResponse> ProcessBulkAsync(BulkShortenRequest request, string baseUrl, CancellationToken cancellationToken = default)
    {
        var results = new List<BulkShortenResultItem>();
        int successCount = 0;
        int failureCount = 0;

        foreach (var item in request.Links)
        {
            try
            {
                var created = await CreateAsync(new CreateShortLinkRequest(
                    OriginalUrl: item.OriginalUrl,
                    CustomSlug: item.CustomSlug,
                    Title: item.Title
                ), baseUrl, cancellationToken);

                results.Add(new BulkShortenResultItem(
                    OriginalUrl: item.OriginalUrl,
                    ShortUrl: created.ShortUrl,
                    Slug: created.Slug,
                    Success: true,
                    ErrorMessage: null
                ));
                successCount++;
            }
            catch (Exception ex)
            {
                results.Add(new BulkShortenResultItem(
                    OriginalUrl: item.OriginalUrl,
                    ShortUrl: null,
                    Slug: null,
                    Success: false,
                    ErrorMessage: ex.Message
                ));
                failureCount++;
            }
        }

        return new BulkShortenResponse(
            TotalProcessed: request.Links.Count,
            SuccessCount: successCount,
            FailureCount: failureCount,
            Results: results
        );
    }

    private async Task CacheLinkAsync(ShortLink shortLink, CancellationToken cancellationToken)
    {
        var cached = new CachedShortLink(
            Id: shortLink.Id,
            Slug: shortLink.Slug,
            OriginalUrl: shortLink.OriginalUrl,
            RedirectType: shortLink.RedirectType,
            IsActive: shortLink.IsActive,
            DomainHostname: shortLink.DomainMapping?.Hostname,
            ExpiresAtUtc: shortLink.ExpiresAtUtc,
            MaxClicks: shortLink.MaxClicks,
            ClickCount: shortLink.ClickCount,
            Rules: shortLink.Rules.Select(r => new CachedRule(r.Type, r.MatchValue, r.TargetUrl, r.Priority)).ToList()
        );

        await _cacheService.SetShortLinkAsync(shortLink.Slug, shortLink.DomainMapping?.Hostname, cached, TimeSpan.FromHours(24), cancellationToken);
    }

    private static ShortLinkResponse MapToResponse(ShortLink l, string baseUrl)
    {
        var host = !string.IsNullOrWhiteSpace(l.DomainMapping?.Hostname)
            ? $"https://{l.DomainMapping.Hostname}"
            : baseUrl.TrimEnd('/');

        return new ShortLinkResponse(
            Id: l.Id,
            Slug: l.Slug,
            OriginalUrl: l.OriginalUrl,
            ShortUrl: $"{host}/{l.Slug}",
            Title: l.Title,
            Description: l.Description,
            RedirectType: l.RedirectType,
            IsActive: l.IsActive,
            DomainHostname: l.DomainMapping?.Hostname,
            ExpiresAtUtc: l.ExpiresAtUtc,
            MaxClicks: l.MaxClicks,
            ClickCount: l.ClickCount,
            CreatedAtUtc: l.CreatedAtUtc,
            Tags: l.Tags.Select(t => t.Tag.Name).ToList(),
            Rules: l.Rules.Select(r => new ShortLinkRuleDto(r.Id, (int)r.Type, r.MatchValue, r.TargetUrl, r.Priority)).ToList()
        );
    }
}

