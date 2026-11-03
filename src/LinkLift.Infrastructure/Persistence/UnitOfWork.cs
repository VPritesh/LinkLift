using LinkLift.Application.Common.Interfaces;

namespace LinkLift.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly LinkLiftDbContext _context;

    public UnitOfWork(LinkLiftDbContext context)
    {
        _context = context;
    }

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}

