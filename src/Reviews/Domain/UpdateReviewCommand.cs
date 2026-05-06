namespace Reviews.Domain;

public sealed record UpdateReviewCommand(
    short Rating,
    string? Comment,
    List<SeasonReview>? Seasons) : IReviewCommand;
