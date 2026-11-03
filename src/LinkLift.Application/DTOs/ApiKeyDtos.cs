namespace LinkLift.Application.DTOs;

public record ApiKeyResponse(
    long Id,
    string Name,
    string KeyPrefix,
    string Scopes,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? LastUsedAtUtc,
    string? PlainTextKey = null // Provided once during creation
);

public record CreateApiKeyRequest(
    string Name,
    string Scopes = "links:create,analytics:read"
);

