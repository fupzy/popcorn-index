namespace Reviews.Domain;

public sealed record CreateReviewCommand(
    Guid UserId,
    MediaType MediaType,
    int TmdbId,
    short Rating,
    string? Comment,
    List<SeasonReview>? Seasons) : IReviewCommand;
