using FluentAssertions;
using LinkLift.Infrastructure.Detection;

namespace LinkLift.UnitTests.Infrastructure;

public class BotAndDeviceDetectorTests
{
    private readonly BotDetectionService _botDetector = new();
    private readonly SimpleDeviceDetector _deviceDetector = new();

    [Theory]
    [InlineData("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", true)]
    [InlineData("curl/7.68.0", true)]
    [InlineData("python-requests/2.25.1", true)]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", false)]
    public void BotDetector_IdentifiesBotsCorrectly(string userAgent, bool expectedIsBot)
    {
        var result = _botDetector.Evaluate(userAgent, "10.0.0.1", DateTime.UtcNow, "sample-slug");
        result.IsBot.Should().Be(expectedIsBot);
    }

    [Fact]
    public void BotDetector_FlagsRapidClicksUnder3Seconds()
    {
        var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
        var ip = "203.0.113.19";
        var slug = "rapid-test";
        var now = DateTime.UtcNow;

        var firstClick = _botDetector.Evaluate(ua, ip, now, slug);
        firstClick.IsBot.Should().BeFalse();

        // 1 second later
        var secondClick = _botDetector.Evaluate(ua, ip, now.AddSeconds(1), slug);
        secondClick.IsBot.Should().BeTrue();
        secondClick.Reason.Should().Contain("Rapid consecutive click");
    }

    [Fact]
    public void DeviceDetector_IdentifiesPlatformsAccurately()
    {
        var iPhoneUa = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
        var result = _deviceDetector.Detect(iPhoneUa);

        result.DeviceType.Should().Be(LinkLift.Domain.Enums.DeviceType.Mobile);
        result.OperatingSystem.Should().Be("iOS");
        result.Browser.Should().Be("Safari");
    }
}

