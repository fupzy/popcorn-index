using System.Net;
using System.Text.Json.JsonDiffPatch;
using System.Text.Json.Nodes;
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

    [When("I call the TMDB proxy with {string} on {string} and body")]
    public Task WhenICallTheTmdbProxyWithBody(string method, string path, string body)
        => apiTesting.SendRequest($"{BaseUrl}/{path}", new HttpMethod(method), body);

    [Then("the TMDB API was called with {string} on {string}")]
    public void ThenTheTmdbApiWasCalledWith(string method, string pathAndQuery)
    {
        var handler = steps.GetRequiredService<MockTmdbHandler>();
        handler.LastRequestMethod.Should().Be(new HttpMethod(method));
        handler.LastRequestUri.Should().NotBeNull();
        handler.LastRequestUri!.PathAndQuery.Should().Be(pathAndQuery);
    }

    [Then("the TMDB API received the body")]
    public void ThenTheTmdbApiReceivedTheBody(string expectedBody)
    {
        var handler = steps.GetRequiredService<MockTmdbHandler>();
        handler.LastRequestBody.Should().NotBeNull();

        var actual = JsonNode.Parse(handler.LastRequestBody!);
        var expected = JsonNode.Parse(expectedBody);

        var diff = actual.Diff(expected);
        diff.Should().BeNull(diff?.ToJsonString());
    }
}
