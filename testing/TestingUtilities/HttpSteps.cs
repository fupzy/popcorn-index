using System.Net;
using System.Text.Json.Nodes;
using System.Text.Json.JsonDiffPatch;
using AwesomeAssertions;
using Reqnroll;

namespace TestingUtilities;

[Binding]
public sealed class HttpSteps(ApiTesting apiTesting)
{
    public HttpResponseMessage? ResponseMessage => apiTesting.ResponseMessage;

    [Then("I receive a {string} status")]
    public void ThenIReceiveAStatus(string expectedStatus)
    {
        this.ResponseMessage.Should().NotBeNull();
        this.ResponseMessage?.StatusCode.Should().Be(Enum.Parse<HttpStatusCode>(expectedStatus));
    }

    [Then("I receive the validation errors")]
    public async Task ThenIReceiveTheValidationErrors(string multilineText)
    {
        var receivedContent = await (this.ResponseMessage?.Content.ReadAsStringAsync() ?? Task.FromResult("{}"));
        var received = JsonNode.Parse(receivedContent);

        var receivedErrors = received?["errors"] ?? throw new InvalidOperationException("No errors received.");

        var diff = receivedErrors.Diff(JsonNode.Parse(multilineText));
        diff.Should().BeNull(diff?.ToJsonString());
    }

    [Then("I receive the response")]
    public async Task ThenIReceiveTheResponse(string multilineText)
    {
        var receivedContent = await (this.ResponseMessage?.Content.ReadAsStringAsync() ?? Task.FromResult("{}"));
        var receivedJson = JsonNode.Parse(receivedContent) ?? throw new InvalidOperationException("Cannot parse received as json.");

        var diff = receivedJson.Diff(JsonNode.Parse(multilineText));
        diff.Should().BeNull(diff?.ToJsonString());
    }
}
