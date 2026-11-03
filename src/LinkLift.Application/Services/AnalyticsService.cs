using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.DTOs;
using LinkLift.Domain.Entities;

namespace LinkLift.Application.Services;

public interface IAnalyticsService
{
    Task<LinkAnalyticsSummaryDto?> GetSummaryAsync(long shortLinkId, CancellationToken cancellationToken = default);
    Task<LinkAnalyticsSummaryDto?> GetSummaryBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly IRepository<ClickTelemetry> _telemetryRepo;
    private readonly IShortLinkRepository _shortLinkRepo;

    public AnalyticsService(IRepository<ClickTelemetry> telemetryRepo, IShortLinkRepository shortLinkRepo)
    {
        _telemetryRepo = telemetryRepo;
        _shortLinkRepo = shortLinkRepo;
    }

    public async Task<LinkAnalyticsSummaryDto?> GetSummaryAsync(long shortLinkId, CancellationToken cancellationToken = default)
    {
        var link = await _shortLinkRepo.GetByIdAsync(shortLinkId, cancellationToken);
        if (link == null) return null;

        return await GenerateSummaryAsync(link, cancellationToken);
    }

    public async Task<LinkAnalyticsSummaryDto?> GetSummaryBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var link = await _shortLinkRepo.GetBySlugWithDetailsAsync(slug, null, cancellationToken);
        if (link == null) return null;

        return await GenerateSummaryAsync(link, cancellationToken);
    }

    private async Task<LinkAnalyticsSummaryDto> GenerateSummaryAsync(ShortLink link, CancellationToken cancellationToken)
    {
        var records = await _telemetryRepo.ListAsync(t => t.ShortLinkId == link.Id, cancellationToken);

        var totalClicks = records.Count;
        var botClicks = records.Count(r => r.IsBot);
        var realClicks = totalClicks - botClicks;

        var clicksByCountry = records
            .Where(r => !string.IsNullOrEmpty(r.CountryCode))
            .GroupBy(r => r.CountryCode!)
            .ToDictionary(g => g.Key, g => g.Count());

        var clicksByDevice = records
            .GroupBy(r => r.DeviceType.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var clicksByBrowser = records
            .Where(r => !string.IsNullOrEmpty(r.Browser))
            .GroupBy(r => r.Browser!)
            .ToDictionary(g => g.Key, g => g.Count());

        var clicksByOs = records
            .Where(r => !string.IsNullOrEmpty(r.OperatingSystem))
            .GroupBy(r => r.OperatingSystem!)
            .ToDictionary(g => g.Key, g => g.Count());

        var clicksByReferrer = records
            .Where(r => !string.IsNullOrEmpty(r.Referrer))
            .GroupBy(r => r.Referrer!)
            .ToDictionary(g => g.Key, g => g.Count());

        var recentClicks = records
            .OrderByDescending(r => r.ClickedAtUtc)
            .Take(50)
            .Select(r => new ClickItemDto(
                ClickedAtUtc: r.ClickedAtUtc,
                CountryCode: r.CountryCode,
                DeviceType: r.DeviceType,
                OperatingSystem: r.OperatingSystem,
                Browser: r.Browser,
                Referrer: r.Referrer,
                IsBot: r.IsBot,
                BotReason: r.BotReason
            ))
            .ToList();

        return new LinkAnalyticsSummaryDto(
            ShortLinkId: link.Id,
            Slug: link.Slug,
            TotalClicks: totalClicks,
            RealClicks: realClicks,
            BotClicks: botClicks,
            ClicksByCountry: clicksByCountry,
            ClicksByDevice: clicksByDevice,
            ClicksByBrowser: clicksByBrowser,
            ClicksByOs: clicksByOs,
            ClicksByReferrer: clicksByReferrer,
            RecentClicks: recentClicks
        );
    }
}

