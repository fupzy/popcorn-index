namespace Reviews.Domain;

public interface IReviewRepository
{
    IAsyncEnumerable<Review> GetMediaReviews(MediaType mediaType, int tmdbId);

    IAsyncEnumerable<Review> GetUserReviews(Guid userId);

    Task<Review?> GetUserMediaReview(Guid userId, MediaType mediaType, int tmdbId);

    Task<Review> Create(CreateReviewCommand command);

    Task<Review?> Update(Guid id, UpdateReviewCommand command);
}
