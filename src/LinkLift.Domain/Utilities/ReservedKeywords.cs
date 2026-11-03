namespace LinkLift.Domain.Utilities;

public static class ReservedKeywords
{
    private static readonly HashSet<string> Reserved = new(StringComparer.OrdinalIgnoreCase)
    {
        "api", "swagger", "health", "login", "register", "auth", "admin", "dashboard",
        "static", "assets", "favicon.ico", "robots.txt", "sitemap.xml", "ws", "hub"
    };

    public static bool IsReserved(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug)) return true;
        return Reserved.Contains(slug.Trim().ToLowerInvariant());
    }
}

