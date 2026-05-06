using Reqnroll;
using TestingUtilities;

namespace Reviews.Specs.Steps;

[Binding]
public sealed class ReviewsSteps(ApiTesting apiTesting)
{
    private const string BaseUrl = "/api/v1/reviews";

    [When("I get the reviews of movie {int}")]
    public Task WhenIGetTheReviewsOfMovie(int tmdbId) => apiTesting.Get($"{BaseUrl}/movies/{tmdbId}");

    [When("I get the reviews of series {int}")]
    public Task WhenIGetTheReviewsOfSeries(int tmdbId) => apiTesting.Get($"{BaseUrl}/series/{tmdbId}");

    [When("I get the reviews of user {string}")]
    public Task WhenIGetTheReviewsOfUser(string userId) => apiTesting.Get($"{BaseUrl}/users/{userId}");

    [When("I create a review with the command")]
    public Task WhenICreateAReviewWithTheCommand(string command) => apiTesting.PostString(BaseUrl, command);

    [When("I update the review {string} with the command")]
    public Task WhenIUpdateTheReviewWithTheCommand(string id, string command) => apiTesting.PutString($"{BaseUrl}/{id}", command);
}
