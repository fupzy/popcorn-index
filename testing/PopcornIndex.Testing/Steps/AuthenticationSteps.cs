using PopcornIndex.Testing.Mocks;
using Reqnroll;
using TestingUtilities;

namespace PopcornIndex.Testing.Steps;

[Binding]
public sealed class AuthenticationSteps(ApiTesting apiTesting)
{
    [Given("I am authenticated as the user {string}")]
    public void GivenIAmAuthenticatedAsTheUser(string userId)
        => apiTesting.AddHeader(MockAuthenticationHandler.UserIdHeaderName, userId);
}
