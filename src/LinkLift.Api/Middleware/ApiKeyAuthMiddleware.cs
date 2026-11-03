using System.Security.Claims;
using LinkLift.Application.Services;
using Microsoft.AspNetCore.Http;

namespace LinkLift.Api.Middleware;

public class ApiKeyAuthMiddleware
{
    private const string ApiKeyHeaderName = "X-Api-Key";
    private readonly RequestDelegate _next;

    public ApiKeyAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IApiKeyService apiKeyService)
    {
        var endpoint = context.GetEndpoint();
        var requiresApiKey = endpoint?.Metadata.GetMetadata<RequireApiKeyAttribute>();

        if (requiresApiKey != null)
        {
            if (!context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var extractedApiKey) ||
                string.IsNullOrWhiteSpace(extractedApiKey))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "API Key missing in 'X-Api-Key' header." });
                return;
            }

            var apiKey = await apiKeyService.ValidateApiKeyAsync(extractedApiKey.ToString());
            if (apiKey == null)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid or inactive API Key." });
                return;
            }

            if (!string.IsNullOrWhiteSpace(requiresApiKey.RequiredScope) &&
                !apiKey.HasScope(requiresApiKey.RequiredScope))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { error = $"Insufficient permissions. Required scope: '{requiresApiKey.RequiredScope}'." });
                return;
            }

            var identity = new ClaimsIdentity("ApiKey");
            identity.AddClaim(new Claim(ClaimTypes.Name, apiKey.Name));
            identity.AddClaim(new Claim("ApiKeyId", apiKey.Id.ToString()));
            context.User = new ClaimsPrincipal(identity);
        }

        await _next(context);
    }
}

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class RequireApiKeyAttribute : Attribute
{
    public string? RequiredScope { get; }

    public RequireApiKeyAttribute(string? requiredScope = null)
    {
        RequiredScope = requiredScope;
    }
}

