using Microsoft.Extensions.DependencyInjection;
using LinkLift.Application.Services;

namespace LinkLift.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IRedirectionEngine, RedirectionEngine>();
        services.AddScoped<IShortLinkService, ShortLinkService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IDomainService, DomainService>();
        services.AddScoped<IApiKeyService, ApiKeyService>();

        return services;
    }
}

