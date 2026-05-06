namespace Reviews.Domain;

public interface IReviewCommand
{
    short Rating { get; }

    string? Comment { get; }

    List<SeasonReview>? Seasons { get; }
}
