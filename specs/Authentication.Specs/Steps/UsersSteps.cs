using Reqnroll;
using TestingUtilities;

namespace Authentication.Specs.Steps;

[Binding]
public sealed class UsersSteps(ApiTesting apiTesting)
{
    private const string BaseUrl = "/api/v1/authentication";

    [When("I register a user with the command")]
    public Task WhenIRegisterAUserWithTheCommand(string command) => apiTesting.PostString($"{BaseUrl}/register", command);

    [When("A user log in with the command")]
    public Task WhenAUserLogInWithTheCommand(string command) => apiTesting.PostString($"{BaseUrl}/login", command);
}
