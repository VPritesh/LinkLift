using FluentAssertions;
using LinkLift.Application.Common.Models;
using LinkLift.Application.Common.Utilities;
using LinkLift.Application.Services;
using LinkLift.Domain.Entities;
using LinkLift.Domain.Enums;

namespace LinkLift.UnitTests.Application;

public class RedirectionEngineTests
{
    private readonly RedirectionEngine _engine = new();

    [Fact]
    public void Evaluate_ReturnsOriginalUrl_WhenNoDynamicRulesMatch()
    {
        var link = new CachedShortLink(
            Id: 1,
            Slug: "test",
            OriginalUrl: "https://example.com/main",
            RedirectType: RedirectType.Found,
            IsActive: true,
            DomainHostname: null,
            ExpiresAtUtc: null,
            MaxClicks: null,
            ClickCount: 10,
            Rules: new List<CachedRule>()
        );

        var result = _engine.Evaluate(link, "US", DeviceType.Desktop, "Windows");

        result.IsExpiredOrDeactivated.Should().BeFalse();
        result.TargetUrl.Should().Be("https://example.com/main");
    }

    [Fact]
    public void Evaluate_RoutesByCountry_WhenCountryRuleMatches()
    {
        var rules = new List<CachedRule>
        {
            new(RuleType.Country, "CA", "https://example.com/canada", 0),
            new(RuleType.Country, "GB", "https://example.com/uk", 1)
        };

        var link = new CachedShortLink(
            Id: 2,
            Slug: "geo",
            OriginalUrl: "https://example.com/fallback",
            RedirectType: RedirectType.Found,
            IsActive: true,
            DomainHostname: null,
            ExpiresAtUtc: null,
            MaxClicks: null,
            ClickCount: 0,
            Rules: rules
        );

        var resultCA = _engine.Evaluate(link, "CA", DeviceType.Desktop, "Windows");
        resultCA.TargetUrl.Should().Be("https://example.com/canada");

        var resultGB = _engine.Evaluate(link, "GB", DeviceType.Mobile, "iOS");
        resultGB.TargetUrl.Should().Be("https://example.com/uk");

        var resultFR = _engine.Evaluate(link, "FR", DeviceType.Desktop, "Linux");
        resultFR.TargetUrl.Should().Be("https://example.com/fallback");
    }

    [Fact]
    public void Evaluate_RoutesByDevice_WhenDeviceRuleMatches()
    {
        var rules = new List<CachedRule>
        {
            new(RuleType.Device, "Mobile", "https://example.com/mobile-app", 0)
        };

        var link = new CachedShortLink(
            Id: 3,
            Slug: "device",
            OriginalUrl: "https://example.com/desktop-landing",
            RedirectType: RedirectType.Found,
            IsActive: true,
            DomainHostname: null,
            ExpiresAtUtc: null,
            MaxClicks: null,
            ClickCount: 0,
            Rules: rules
        );

        var resultMobile = _engine.Evaluate(link, "US", DeviceType.Mobile, "iOS");
        resultMobile.TargetUrl.Should().Be("https://example.com/mobile-app");

        var resultDesktop = _engine.Evaluate(link, "US", DeviceType.Desktop, "macOS");
        resultDesktop.TargetUrl.Should().Be("https://example.com/desktop-landing");
    }

    [Fact]
    public void Evaluate_ReturnsExpired_WhenLinkPastExpiration()
    {
        var link = new CachedShortLink(
            Id: 4,
            Slug: "expired",
            OriginalUrl: "https://example.com",
            RedirectType: RedirectType.Found,
            IsActive: true,
            DomainHostname: null,
            ExpiresAtUtc: DateTime.UtcNow.AddMinutes(-5),
            MaxClicks: null,
            ClickCount: 1,
            Rules: new List<CachedRule>()
        );

        var result = _engine.Evaluate(link, "US", DeviceType.Desktop, "Windows");
        result.IsExpiredOrDeactivated.Should().BeTrue();
    }

    [Fact]
    public void AnonymizationHelper_ShouldAnonymizeIpCorrectly()
    {
        var ip = "192.168.1.45";
        var hashed1 = AnonymizationHelper.AnonymizeAndHashIp(ip);
        var ipSameSubnet = "192.168.1.99";
        var hashed2 = AnonymizationHelper.AnonymizeAndHashIp(ipSameSubnet);

        hashed1.Should().NotBeNull();
        hashed1.Should().Be(hashed2); // Because 192.168.1.0 is hashed for both
    }
}

