using System.Net;
using LinkLift.Application.Common.Interfaces;

namespace LinkLift.Infrastructure.Detection;

public class SimpleGeoLookupService : IGeoLookupService
{
    public string? ResolveCountryCode(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress)) return "XX";

        // Check if loopback or private
        if (IPAddress.TryParse(ipAddress, out var parsed))
        {
            if (IPAddress.IsLoopback(parsed)) return "LOCAL";
            var bytes = parsed.GetAddressBytes();
            if (bytes.Length == 4)
            {
                // 10.x.x.x, 192.168.x.x, 172.16.x.x - 172.31.x.x
                if (bytes[0] == 10 || (bytes[0] == 192 && bytes[1] == 168) || (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31))
                    return "LAN";
            }
        }

        // Return a default country or simulation tag when no offline MaxMind database is mounted
        return "US";
    }
}

