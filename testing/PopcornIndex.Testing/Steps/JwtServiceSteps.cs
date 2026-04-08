using Authentication.Domain;
using PopcornIndex.Testing.Mocks;
using Reqnroll;
using Reqnroll.Assist;
using TestingUtilities;

namespace PopcornIndex.Testing.Steps;

[Binding]
internal class JwtServiceSteps(ServiceTestingSteps steps)
{
    [Given("the generated tokens for users")]
    public void GivenTheGeneratedTokensForUsers(DataTable dataTable)
    {
        var mockJwtService = steps.GetRequiredService<IJwtService>() as MockJwtService;

        foreach (var row in dataTable.Rows)
        {
            var username = row.GetString("Username");
            var token = row.GetString("Token");

            mockJwtService?.tokens.Add(username, token);
        }
    }
}
