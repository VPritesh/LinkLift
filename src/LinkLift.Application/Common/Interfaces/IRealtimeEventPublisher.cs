using LinkLift.Application.Common.Models;

namespace LinkLift.Application.Common.Interfaces;

public interface IRealtimeEventPublisher
{
    Task PublishClickEventAsync(ClickEventNotification notification, CancellationToken cancellationToken = default);
}

