using LinkLift.Domain.Enums;

namespace LinkLift.Application.Common.Interfaces;

public record DeviceDetectionResult(
    DeviceType DeviceType,
    string? OperatingSystem,
    string? Browser
);

public interface IDeviceDetector
{
    DeviceDetectionResult Detect(string? userAgent);
}

