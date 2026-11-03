using LinkLift.Domain.Entities;

namespace LinkLift.Application.Common.Interfaces;

public interface IClickTelemetryQueue
{
    ValueTask EnqueueAsync(ClickTelemetry telemetry, CancellationToken cancellationToken = default);
    IAsyncEnumerable<ClickTelemetry> ReadAllAsync(CancellationToken cancellationToken);
}

