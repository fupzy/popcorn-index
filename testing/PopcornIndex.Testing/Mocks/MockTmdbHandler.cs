using System.Net;
using System.Text;

namespace PopcornIndex.Testing.Mocks;

/// <summary>
/// Stands in for the real TMDB HTTP endpoint during tests. Registered as the primary
/// <see cref="HttpMessageHandler"/> of the default <see cref="HttpClient"/> so that the
/// <c>TMDBController</c> talks to us instead of <c>api.themoviedb.org</c>.
/// </summary>
public sealed class MockTmdbHandler : HttpMessageHandler
{
    public HttpMethod? LastRequestMethod { get; private set; }

    public Uri? LastRequestUri { get; private set; }

    public string? LastRequestBody { get; private set; }

    public HttpStatusCode NextStatusCode { get; set; } = HttpStatusCode.OK;

    public string NextResponseBody { get; set; } = "{}";

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        this.LastRequestMethod = request.Method;
        this.LastRequestUri = request.RequestUri;
        this.LastRequestBody = request.Content != null ? await request.Content.ReadAsStringAsync(cancellationToken) : null;

        return new HttpResponseMessage(this.NextStatusCode)
        {
            Content = new StringContent(this.NextResponseBody, Encoding.UTF8, "application/json"),
        };
    }
}
