using Reqnroll;
using TestingUtilities;

namespace MockFeature.Specs.Items;

[Binding]
public sealed class ItemsSteps(ApiTesting apiTesting)
{
    private const string BaseUrl = "v1/items";

    [When("I get the items")]
    public Task WhenIGetTheItems() => apiTesting.Get(BaseUrl);
}
