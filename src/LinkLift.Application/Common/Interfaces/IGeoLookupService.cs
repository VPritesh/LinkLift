namespace LinkLift.Application.Common.Interfaces;

public interface IGeoLookupService
{
    string? ResolveCountryCode(string? ipAddress);
}

