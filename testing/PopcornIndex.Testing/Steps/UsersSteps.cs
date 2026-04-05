using Reqnroll;
using TestingUtilities;
using Users.Infrastructure;

namespace PopcornIndex.Testing.Steps;

[Binding]
public sealed class UsersSteps(ServiceTestingSteps steps)
{
    private readonly AppTestingService appTestingService = steps.AppTestingService;

    [Given("the defined users")]
    public async Task GivenTheDefinedUsers(DataTable dataTable)
    {
        await this.appTestingService.Execute(async (UsersDbContext context) =>
        {
            var daos = dataTable.CreateSet<UserDao>();

            await context.Users.AddRangeAsync(daos);
            await context.SaveChangesAsync();
        });
    }

}
