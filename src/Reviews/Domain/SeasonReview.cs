namespace Reviews.Domain;

public sealed class SeasonReview(int seasonNumber, short rating, string? comment)
{
    public int SeasonNumber { get; } = seasonNumber;

    public short Rating { get; set; } = rating;

    public string? Comment { get; set; } = comment;
}
