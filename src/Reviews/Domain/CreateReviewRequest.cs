namespace Reviews.Domain;

public sealed record CreateReviewRequest(
    MediaType MediaType,
    int TmdbId,
    short Rating,
    string? Comment,
    List<SeasonReview>? Seasons) : IReviewCommand;
