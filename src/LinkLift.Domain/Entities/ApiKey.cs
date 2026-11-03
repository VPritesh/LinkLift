using LinkLift.Domain.Common;

namespace LinkLift.Domain.Entities;

public class ApiKey : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public string Scopes { get; set; } = "links:create,analytics:read"; // Comma-separated scopes
    public bool IsActive { get; set; } = true;
    public DateTime? LastUsedAtUtc { get; set; }

    public bool HasScope(string scope)
    {
        if (string.IsNullOrWhiteSpace(Scopes)) return false;
        var parts = Scopes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return parts.Contains(scope, StringComparer.OrdinalIgnoreCase) || parts.Contains("admin:write", StringComparer.OrdinalIgnoreCase);
    }
}

