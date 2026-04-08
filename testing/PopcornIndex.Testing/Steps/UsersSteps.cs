using AwesomeAssertions;
using Microsoft.EntityFrameworkCore;
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

    [Then("the stored users are")]
    public async Task ThenTheStoredUsersAre(DataTable dataTable)
    {
        await this.appTestingService.Execute(async (UsersDbContext context) =>
        {
            var expected = dataTable.CreateSet<UserDao>();
            var stored = await context.Set<UserDao>().ToListAsync();

            stored.Should().BeEquivalentTo(expected);
        });
    }
}
