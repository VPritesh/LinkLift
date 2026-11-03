using Microsoft.EntityFrameworkCore;
using LinkLift.Domain.Entities;

namespace LinkLift.Infrastructure.Persistence;

public class LinkLiftDbContext : DbContext
{
    public LinkLiftDbContext(DbContextOptions<LinkLiftDbContext> options) : base(options)
    {
    }

    public DbSet<ShortLink> ShortLinks => Set<ShortLink>();
    public DbSet<ShortLinkRule> ShortLinkRules => Set<ShortLinkRule>();
    public DbSet<DomainMapping> DomainMappings => Set<DomainMapping>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ShortLinkTag> ShortLinkTags => Set<ShortLinkTag>();
    public DbSet<ClickTelemetry> ClickTelemetries => Set<ClickTelemetry>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ShortLink
        modelBuilder.Entity<ShortLink>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Slug).IsRequired().HasMaxLength(128);
            builder.Property(e => e.OriginalUrl).IsRequired().HasMaxLength(2048);
            builder.Property(e => e.Title).HasMaxLength(256);
            builder.Property(e => e.Description).HasMaxLength(1024);

            // Composite index for ultra-fast domain-aware slug lookup
            builder.HasIndex(e => new { e.Slug, e.DomainMappingId }).IsUnique();

            builder.HasOne(e => e.DomainMapping)
                .WithMany(d => d.Links)
                .HasForeignKey(e => e.DomainMappingId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ShortLinkRule
        modelBuilder.Entity<ShortLinkRule>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.MatchValue).IsRequired().HasMaxLength(128);
            builder.Property(e => e.TargetUrl).IsRequired().HasMaxLength(2048);

            builder.HasOne(e => e.ShortLink)
                .WithMany(s => s.Rules)
                .HasForeignKey(e => e.ShortLinkId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // DomainMapping
        modelBuilder.Entity<DomainMapping>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Hostname).IsRequired().HasMaxLength(256);
            builder.HasIndex(e => e.Hostname).IsUnique();
        });

        // Tag & Many-to-Many
        modelBuilder.Entity<Tag>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Name).IsRequired().HasMaxLength(64);
            builder.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<ShortLinkTag>(builder =>
        {
            builder.HasKey(e => new { e.ShortLinkId, e.TagId });

            builder.HasOne(e => e.ShortLink)
                .WithMany(s => s.Tags)
                .HasForeignKey(e => e.ShortLinkId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Tag)
                .WithMany(t => t.ShortLinks)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ClickTelemetry
        modelBuilder.Entity<ClickTelemetry>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.DestinationUrl).IsRequired().HasMaxLength(2048);
            builder.Property(e => e.CountryCode).HasMaxLength(8);
            builder.Property(e => e.OperatingSystem).HasMaxLength(64);
            builder.Property(e => e.Browser).HasMaxLength(64);
            builder.Property(e => e.HashedIpAddress).HasMaxLength(128);

            builder.HasIndex(e => e.ShortLinkId);
            builder.HasIndex(e => e.ClickedAtUtc);
            builder.HasIndex(e => e.IsBot);

            builder.HasOne(e => e.ShortLink)
                .WithMany(s => s.Telemetry)
                .HasForeignKey(e => e.ShortLinkId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ApiKey
        modelBuilder.Entity<ApiKey>(builder =>
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Name).IsRequired().HasMaxLength(128);
            builder.Property(e => e.KeyPrefix).IsRequired().HasMaxLength(32);
            builder.Property(e => e.KeyHash).IsRequired().HasMaxLength(128);
            builder.HasIndex(e => e.KeyPrefix);
        });
    }
}

