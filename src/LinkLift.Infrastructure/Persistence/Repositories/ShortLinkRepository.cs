using Microsoft.EntityFrameworkCore;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Domain.Entities;

namespace LinkLift.Infrastructure.Persistence.Repositories;

public class ShortLinkRepository : EfRepository<ShortLink>, IShortLinkRepository
{
    public ShortLinkRepository(LinkLiftDbContext context) : base(context)
    {
    }

    public async Task<ShortLink?> GetBySlugWithDetailsAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim();
        var query = DbSet
            .Include(s => s.DomainMapping)
            .Include(s => s.Rules)
            .Include(s => s.Tags)
                .ThenInclude(st => st.Tag)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(hostname) && hostname != "localhost" && hostname != "127.0.0.1")
        {
            var host = hostname.Trim().ToLowerInvariant();
            query = query.Where(s => s.Slug.ToLower() == cleanSlug.ToLower() &&
                                     s.DomainMapping != null &&
                                     s.DomainMapping.Hostname.ToLower() == host);
        }
        else
        {
            // Default domain / apex / localhost
            query = query.Where(s => s.Slug.ToLower() == cleanSlug.ToLower() && s.DomainMappingId == null);
        }

        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> IsSlugTakenAsync(string slug, string? hostname = null, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(hostname))
        {
            var host = hostname.Trim().ToLowerInvariant();
            return await DbSet.AnyAsync(s => s.Slug.ToLower() == cleanSlug &&
                                             s.DomainMapping != null &&
                                             s.DomainMapping.Hostname.ToLower() == host, cancellationToken);
        }

        return await DbSet.AnyAsync(s => s.Slug.ToLower() == cleanSlug && s.DomainMappingId == null, cancellationToken);
    }

    public async Task IncrementClickCountAsync(long shortLinkId, CancellationToken cancellationToken = default)
    {
        var link = await DbSet.FindAsync(new object[] { shortLinkId }, cancellationToken);
        if (link != null)
        {
            link.ClickCount++;
            await Context.SaveChangesAsync(cancellationToken);
        }
    }

    public override async Task<IReadOnlyList<ShortLink>> ListAsync(
        System.Linq.Expressions.Expression<Func<ShortLink, bool>>? predicate = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(s => s.DomainMapping)
            .Include(s => s.Rules)
            .Include(s => s.Tags)
                .ThenInclude(st => st.Tag)
            .AsQueryable();

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        return await query.ToListAsync(cancellationToken);
    }
}

