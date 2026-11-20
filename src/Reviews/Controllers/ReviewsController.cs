using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Reviews.Domain;
using Utilities.Extensions;

namespace Reviews.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/reviews")]
[ApiExplorerSettings(GroupName = "v1")]
public sealed class ReviewsController(
    IReviewRepository reviewRepository,
    IValidator<CreateReviewRequest> createReviewRequestValidator,
    IValidator<UpdateReviewCommand> updateReviewCommandValidator) : ControllerBase
{
    [HttpGet("movies/{tmdbId}")]
    public IAsyncEnumerable<Review> GetMovieReviews(int tmdbId) => reviewRepository.GetMediaReviews(MediaType.Movie, tmdbId);

    [HttpGet("series/{tmdbId}")]
    public IAsyncEnumerable<Review> GetSeriesReviews(int tmdbId) => reviewRepository.GetMediaReviews(MediaType.Series, tmdbId);

    [HttpGet("users/{userId}")]
    public IAsyncEnumerable<Review> GetUserReviews(Guid userId) => reviewRepository.GetUserReviews(userId);

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = this.User.GetUserId();

        if (userId is null)
            return this.Unauthorized();

        var validationResult = await createReviewRequestValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            validationResult.AddToModelState(this.ModelState);
            return this.ValidationProblem(this.ModelState);
        }

        var command = new CreateReviewCommand(
            userId.Value,
            request.MediaType,
            request.TmdbId,
            request.Rating,
            request.Comment,
            request.Seasons);

        var created = await reviewRepository.Create(command);
        return this.Ok(created);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<Review>> UpdateReview(Guid id, [FromBody] UpdateReviewCommand command)
    {
        var userId = this.User.GetUserId();

        if (userId is null)
            return this.Unauthorized();

        var validationResult = await updateReviewCommandValidator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            validationResult.AddToModelState(this.ModelState);
            return this.ValidationProblem(this.ModelState);
        }

        var updated = await reviewRepository.Update(id, userId.Value, command);
        if (updated is null)
            return this.NotFound();

        return this.Ok(updated);
    }
}
