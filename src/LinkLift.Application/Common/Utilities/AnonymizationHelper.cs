using System.Security.Cryptography;
using System.Text;

namespace LinkLift.Application.Common.Utilities;

public static class AnonymizationHelper
{
    public static string? AnonymizeAndHashIp(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress)) return null;

        var cleanIp = ipAddress.Trim();
        // If IPv4, mask last octet before hashing for GDPR anonymization
        if (cleanIp.Contains('.'))
        {
            var parts = cleanIp.Split('.');
            if (parts.Length == 4)
            {
                cleanIp = $"{parts[0]}.{parts[1]}.{parts[2]}.0";
            }
        }
        else if (cleanIp.Contains(':'))
        {
            // IPv6 mask last 80 bits
            var parts = cleanIp.Split(':');
            if (parts.Length >= 3)
            {
                cleanIp = $"{parts[0]}:{parts[1]}:{parts[2]}::";
            }
        }

        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(cleanIp));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}

