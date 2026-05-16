using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace TMDB.Controllers;

/// <summary>
/// Proxy controller for the TMDB (The Movie Database) v3 REST API.
/// <para>
/// Its sole responsibility is to forward incoming GET requests to <c>https://api.themoviedb.org/3/</c>
/// while appending the server-side <c>TMDB_API_KEY</c> as a query parameter, so that the API key
/// never leaves the backend and is never exposed to the browser.
/// </para>
/// </summary>
[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/tmdb")]
[ApiExplorerSettings(IgnoreApi = true)]
public sealed class TMDBController(IHttpClientFactory httpClientFactory) : ControllerBase
{
    private const string TmdbBaseUrl = "https://api.themoviedb.org/3/";

    [HttpGet("{**path}")]
    public async Task Proxy(string? path, CancellationToken cancellationToken)
    {
        var apiKey = Environment.GetEnvironmentVariable("TMDB_API_KEY") ?? string.Empty;

        var originalQuery = this.Request.QueryString.Value ?? string.Empty;

        // '?' opens the query string if the caller sent none, '&' appends otherwise.
        var separator = string.IsNullOrEmpty(originalQuery) ? "?" : "&";

        var targetUri = $"{TmdbBaseUrl}{path}{originalQuery}{separator}api_key={Uri.EscapeDataString(apiKey)}";

        var client = httpClientFactory.CreateClient();
        using var response = await client.GetAsync(targetUri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        this.Response.StatusCode = (int)response.StatusCode;
        foreach (var header in response.Content.Headers)
            this.Response.Headers[header.Key] = header.Value.ToArray();

        // Let Kestrel (ASP.NET Core Web Server used by WebApplication.CreateBuilder) set its own transfer-encoding instead of reusing TMDB's.
        this.Response.Headers.Remove("transfer-encoding");

        await response.Content.CopyToAsync(this.Response.Body, cancellationToken);
    }
}
