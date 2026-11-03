using LinkLift.Application.Common.Interfaces;
using LinkLift.Domain.Enums;

namespace LinkLift.Infrastructure.Detection;

public class SimpleDeviceDetector : IDeviceDetector
{
    public DeviceDetectionResult Detect(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return new DeviceDetectionResult(DeviceType.Unknown, "Unknown", "Unknown");
        }

        var ua = userAgent.ToLowerInvariant();

        // 1. Detect Device Type
        DeviceType deviceType = DeviceType.Desktop;
        if (ua.Contains("ipad") || ua.Contains("tablet"))
        {
            deviceType = DeviceType.Tablet;
        }
        else if (ua.Contains("mobile") || ua.Contains("android") || ua.Contains("iphone"))
        {
            deviceType = DeviceType.Mobile;
        }

        // 2. Detect OS (Ensure iPhone/iPad/iOS is evaluated before macOS/Mac OS)
        string os = "Other";
        if (ua.Contains("iphone") || ua.Contains("ipad") || ua.Contains("ios"))
        {
            os = "iOS";
        }
        else if (ua.Contains("mac os") || ua.Contains("macintosh"))
        {
            os = "macOS";
        }
        else if (ua.Contains("windows"))
        {
            os = "Windows";
        }
        else if (ua.Contains("android"))
        {
            os = "Android";
        }
        else if (ua.Contains("linux"))
        {
            os = "Linux";
        }

        // 3. Detect Browser
        string browser = "Other";
        if (ua.Contains("edg/")) browser = "Edge";
        else if (ua.Contains("chrome/") && !ua.Contains("edg/")) browser = "Chrome";
        else if (ua.Contains("safari/") && !ua.Contains("chrome/")) browser = "Safari";
        else if (ua.Contains("firefox/")) browser = "Firefox";
        else if (ua.Contains("opr/") || ua.Contains("opera")) browser = "Opera";

        return new DeviceDetectionResult(deviceType, os, browser);
    }
}
