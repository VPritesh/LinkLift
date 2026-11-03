namespace LinkLift.Application.DTOs;

public record DomainMappingDto(
    long Id,
    string Hostname,
    bool IsActive,
    string? CustomNotFoundUrl,
    string? Description,
    int LinkCount
);

public record CreateDomainMappingRequest(
    string Hostname,
    string? CustomNotFoundUrl = null,
    string? Description = null
);

