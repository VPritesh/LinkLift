using Microsoft.AspNetCore.SignalR;
using LinkLift.Application.Common.Models;

namespace LinkLift.Api.Hubs;

public interface IAnalyticsClient
{
    Task ReceiveClickEvent(ClickEventNotification notification);
}

public class AnalyticsHub : Hub<IAnalyticsClient>
{
    public async Task SubscribeToLink(string slug)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"link_{slug.ToLowerInvariant()}");
    }

    public async Task UnsubscribeFromLink(string slug)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"link_{slug.ToLowerInvariant()}");
    }
}

