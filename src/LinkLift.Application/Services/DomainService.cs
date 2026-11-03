using LinkLift.Application.Common.Interfaces;
using LinkLift.Application.DTOs;
using LinkLift.Domain.Entities;

namespace LinkLift.Application.Services;

public interface IDomainService
{
    Task<DomainMappingDto> CreateAsync(CreateDomainMappingRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DomainMappingDto>> ListAsync(CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}

public class DomainService : IDomainService
{
    private readonly IRepository<DomainMapping> _domainRepo;
    private readonly IUnitOfWork _unitOfWork;

    public DomainService(IRepository<DomainMapping> domainRepo, IUnitOfWork unitOfWork)
    {
        _domainRepo = domainRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<DomainMappingDto> CreateAsync(CreateDomainMappingRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Hostname))
            throw new ArgumentException("Hostname is required.", nameof(request.Hostname));

        var clean = request.Hostname.Trim().ToLowerInvariant();
        var exists = await _domainRepo.AnyAsync(d => d.Hostname.ToLower() == clean, cancellationToken);
        if (exists)
            throw new InvalidOperationException($"Domain '{clean}' is already registered.");

        var domain = new DomainMapping
        {
            Hostname = clean,
            CustomNotFoundUrl = request.CustomNotFoundUrl,
            Description = request.Description,
            IsActive = true
        };

        await _domainRepo.AddAsync(domain, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return new DomainMappingDto(domain.Id, domain.Hostname, domain.IsActive, domain.CustomNotFoundUrl, domain.Description, 0);
    }

    public async Task<IReadOnlyList<DomainMappingDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var list = await _domainRepo.ListAsync(null, cancellationToken);
        return list.Select(d => new DomainMappingDto(
            d.Id,
            d.Hostname,
            d.IsActive,
            d.CustomNotFoundUrl,
            d.Description,
            d.Links.Count
        )).ToList();
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var domain = await _domainRepo.GetByIdAsync(id, cancellationToken);
        if (domain == null) return false;

        await _domainRepo.DeleteAsync(domain, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);
        return true;
    }
}

