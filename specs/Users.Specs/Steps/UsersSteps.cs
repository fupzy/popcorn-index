using Reqnroll;
using TestingUtilities;

namespace Users.Specs.Steps;

[Binding]
public sealed class UsersSteps(ApiTesting apiTesting)
{
    private const string BaseUrl = "/api/v1/users";

    [When("I get all the defined users")]
    public Task WhenIGetAllTheDefinedUsers() => apiTesting.Get(BaseUrl);
}
