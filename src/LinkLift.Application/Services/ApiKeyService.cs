using System.Security.Cryptography;
using System.Text;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.DTOs;
using LinkLift.Domain.Entities;

namespace LinkLift.Application.Services;

public interface IApiKeyService
{
    Task<ApiKeyResponse> CreateAsync(CreateApiKeyRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApiKeyResponse>> ListAsync(CancellationToken cancellationToken = default);
    Task<bool> RevokeAsync(long id, CancellationToken cancellationToken = default);
    Task<ApiKey?> ValidateApiKeyAsync(string plainTextKey, CancellationToken cancellationToken = default);
}

public class ApiKeyService : IApiKeyService
{
    private readonly IRepository<ApiKey> _apiKeyRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ApiKeyService(IRepository<ApiKey> apiKeyRepo, IUnitOfWork unitOfWork)
    {
        _apiKeyRepo = apiKeyRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiKeyResponse> CreateAsync(CreateApiKeyRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("API key name is required.", nameof(request.Name));

        // Generate a secure API key: ll_live_<random_bytes>
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
        var fullKey = $"ll_live_{rawToken}";
        var prefix = fullKey[..12]; // e.g. "ll_live_abcd"
        var hash = HashKey(fullKey);

        var apiKey = new ApiKey
        {
            Name = request.Name.Trim(),
            KeyPrefix = prefix,
            KeyHash = hash,
            Scopes = request.Scopes,
            IsActive = true
        };

        await _apiKeyRepo.AddAsync(apiKey, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return new ApiKeyResponse(
            apiKey.Id,
            apiKey.Name,
            apiKey.KeyPrefix,
            apiKey.Scopes,
            apiKey.IsActive,
            apiKey.CreatedAtUtc,
            apiKey.LastUsedAtUtc,
            PlainTextKey: fullKey
        );
    }

    public async Task<IReadOnlyList<ApiKeyResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var keys = await _apiKeyRepo.ListAsync(null, cancellationToken);
        return keys.Select(k => new ApiKeyResponse(
            k.Id,
            k.Name,
            k.KeyPrefix,
            k.Scopes,
            k.IsActive,
            k.CreatedAtUtc,
            k.LastUsedAtUtc
        )).ToList();
    }

    public async Task<bool> RevokeAsync(long id, CancellationToken cancellationToken = default)
    {
        var key = await _apiKeyRepo.GetByIdAsync(id, cancellationToken);
        if (key == null) return false;

        key.IsActive = false;
        await _apiKeyRepo.UpdateAsync(key, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<ApiKey?> ValidateApiKeyAsync(string plainTextKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plainTextKey) || plainTextKey.Length < 12)
            return null;

        var prefix = plainTextKey[..12];
        var keys = await _apiKeyRepo.ListAsync(k => k.KeyPrefix == prefix && k.IsActive, cancellationToken);
        var targetHash = HashKey(plainTextKey);

        var match = keys.FirstOrDefault(k => CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(k.KeyHash),
            Encoding.UTF8.GetBytes(targetHash)
        ));

        if (match != null)
        {
            match.LastUsedAtUtc = DateTime.UtcNow;
            await _apiKeyRepo.UpdateAsync(match, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
        }

        return match;
    }

    private static string HashKey(string key)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(key))).ToLowerInvariant();
    }
}

