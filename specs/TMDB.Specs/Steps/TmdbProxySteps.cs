using System.Net;
using AwesomeAssertions;
using PopcornIndex.Testing.Mocks;
using Reqnroll;
using TestingUtilities;

namespace TMDB.Specs.Steps;

[Binding]
public sealed class TmdbProxySteps(ApiTesting apiTesting, ServiceTestingSteps steps)
{
    private const string BaseUrl = "/api/v1/tmdb";

    [Given("the TMDB API key is {string}")]
    public static void GivenTheTmdbApiKeyIs(string apiKey)
        => Environment.SetEnvironmentVariable("TMDB_API_KEY", apiKey);

    [AfterScenario]
    public static void ClearTmdbApiKey()
        => Environment.SetEnvironmentVariable("TMDB_API_KEY", null);

    [Given("the TMDB API will respond with status {string} and body")]
    public void GivenTheTmdbApiWillRespondWith(string status, string body)
    {
        var handler = steps.GetRequiredService<MockTmdbHandler>();
        handler.NextStatusCode = Enum.Parse<HttpStatusCode>(status);
        handler.NextResponseBody = body;
    }

    [When("I call the TMDB proxy with {string} on {string}")]
    public Task WhenICallTheTmdbProxy(string method, string path)
        => apiTesting.SendRequest($"{BaseUrl}/{path}", new HttpMethod(method));

    [Then("the TMDB API was called with {string} on {string}")]
    public void ThenTheTmdbApiWasCalledWith(string method, string pathAndQuery)
    {
        var handler = steps.GetRequiredService<MockTmdbHandler>();
        handler.LastRequestMethod.Should().Be(new HttpMethod(method));
        handler.LastRequestUri.Should().NotBeNull();
        handler.LastRequestUri!.PathAndQuery.Should().Be(pathAndQuery);
    }
}
