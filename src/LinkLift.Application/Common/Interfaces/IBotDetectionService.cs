namespace LinkLift.Application.Common.Interfaces;

public record BotCheckResult(bool IsBot, string? Reason);

public interface IBotDetectionService
{
    BotCheckResult Evaluate(string? userAgent, string? ipAddress, DateTime requestTimeUtc, string slug);
}

