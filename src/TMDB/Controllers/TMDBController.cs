using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TMDB.Controllers;

/// <summary>
/// Proxy controller for the TMDB (The Movie Database) v3 REST API.
/// <para>
/// Its sole responsibility is to forward incoming requests to <c>https://api.themoviedb.org/3/</c>
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

    /// <summary>
    /// Forwards any HTTP request made to <c>/api/v1/TMDB/{path}</c> to the corresponding TMDB endpoint,
    /// automatically attaching the <c>api_key</c> query parameter read from the <c>TMDB_API_KEY</c>
    /// environment variable.
    /// </summary>
    /// <param name="path">
    /// The TMDB resource path, captured from the URL (e.g. <c>movie/550</c>, <c>search/movie</c>).
    /// Forwarded as-is to TMDB.
    /// </param>
    /// <param name="cancellationToken">Propagates notification that the caller aborted the request.</param>
    /// <remarks>
    /// Behavior:
    /// <list type="bullet">
    ///   <item>HTTP method, query string and request body are forwarded verbatim.</item>
    ///   <item>The <c>api_key</c> query parameter is appended to the existing query string.</item>
    ///   <item>Response status code and content headers are copied back to the caller.</item>
    ///   <item>Arbitrary request headers (Authorization, cookies, ...) are intentionally NOT forwarded.</item>
    /// </list>
    /// </remarks>
    /// <example>
    /// <c>GET /api/v1/TMDB/movie/550</c> →
    /// <c>GET https://api.themoviedb.org/3/movie/550?api_key=&lt;key&gt;</c>
    /// </example>
    [AcceptVerbs("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS")]
    [Route("{**path}")]
    public async Task Proxy(string? path, CancellationToken cancellationToken)
    {
        var apiKey = Environment.GetEnvironmentVariable("TMDB_API_KEY") ?? string.Empty;

        var originalQuery = this.Request.QueryString.Value ?? string.Empty;

        // '?' opens the query string if the caller sent none, '&' appends otherwise.
        var separator = string.IsNullOrEmpty(originalQuery) ? "?" : "&";
        
        var targetUri = $"{TmdbBaseUrl}{path}{originalQuery}{separator}api_key={Uri.EscapeDataString(apiKey)}";

        using var request = new HttpRequestMessage(new HttpMethod(this.Request.Method), targetUri);

        if (!HttpMethods.IsGet(this.Request.Method)
            && !HttpMethods.IsHead(this.Request.Method)
            && !HttpMethods.IsDelete(this.Request.Method))
        {
            request.Content = new StreamContent(this.Request.Body);
            if (!string.IsNullOrEmpty(this.Request.ContentType))
                request.Content.Headers.TryAddWithoutValidation("Content-Type", this.Request.ContentType);
        }

        var client = httpClientFactory.CreateClient();
        using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        this.Response.StatusCode = (int)response.StatusCode;
        foreach (var header in response.Content.Headers)
            this.Response.Headers[header.Key] = header.Value.ToArray();

        // Let Kestrel (ASP.NET Core Web Server used by WebApplication.CreateBuilder) set its own transfer-encoding instead of reusing TMDB's.
        this.Response.Headers.Remove("transfer-encoding");

        await response.Content.CopyToAsync(this.Response.Body, cancellationToken);
    }
}
