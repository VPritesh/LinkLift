using System.Threading.Channels;
using LinkLift.Application.Common.Interfaces;
using LinkLift.Domain.Entities;

namespace LinkLift.Infrastructure.Background;

public class ChannelClickTelemetryQueue : IClickTelemetryQueue
{
    private readonly Channel<ClickTelemetry> _channel;

    public ChannelClickTelemetryQueue()
    {
        // Unbounded or high capacity channel to support 10,000+ clicks/second
        var options = new BoundedChannelOptions(50_000)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        };
        _channel = Channel.CreateBounded<ClickTelemetry>(options);
    }

    public ValueTask EnqueueAsync(ClickTelemetry telemetry, CancellationToken cancellationToken = default)
    {
        return _channel.Writer.WriteAsync(telemetry, cancellationToken);
    }

    public IAsyncEnumerable<ClickTelemetry> ReadAllAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}

