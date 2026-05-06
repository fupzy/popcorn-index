using AwesomeAssertions;
using Microsoft.EntityFrameworkCore;
using Reqnroll;
using Reviews.Infrastructure;
using TestingUtilities;

namespace PopcornIndex.Testing.Steps;

[Binding]
public sealed class ReviewsSteps(ServiceTestingSteps steps)
{
    private readonly AppTestingService appTestingService = steps.AppTestingService;

    [Given("the defined reviews")]
    public async Task GivenTheDefinedReviews(DataTable dataTable)
    {
        await this.appTestingService.Execute(async (ReviewsDbContext context) =>
        {
            var daos = dataTable.CreateSet<ReviewDao>();

            await context.Reviews.AddRangeAsync(daos);
            await context.SaveChangesAsync();
        });
    }

    [Given("the defined season reviews")]
    public async Task GivenTheDefinedSeasonReviews(DataTable dataTable)
    {
        await this.appTestingService.Execute(async (ReviewsDbContext context) =>
        {
            var daos = dataTable.CreateSet<SeasonReviewDao>();

            await context.SeasonReviews.AddRangeAsync(daos);
            await context.SaveChangesAsync();
        });
    }

    [Then("the stored reviews are")]
    public async Task ThenTheStoredReviewsAre(DataTable dataTable)
    {
        var providedColumns = dataTable.Header.ToHashSet();
        await this.appTestingService.Execute(async (ReviewsDbContext context) =>
        {
            var expected = dataTable.CreateSet<ReviewDao>();
            var stored = await context.Set<ReviewDao>().AsNoTracking().ToListAsync();

            stored.Should().BeEquivalentTo(expected, options => options
                .Excluding(r => r.Seasons)
                .Including(info => providedColumns.Contains(info.Name)));
        });
    }

    [Then("the stored season reviews are")]
    public async Task ThenTheStoredSeasonReviewsAre(DataTable dataTable)
    {
        await this.appTestingService.Execute(async (ReviewsDbContext context) =>
        {
            var expected = dataTable.CreateSet<SeasonReviewDao>();
            var stored = await context.Set<SeasonReviewDao>().AsNoTracking().ToListAsync();

            stored.Should().BeEquivalentTo(expected);
        });
    }
}
