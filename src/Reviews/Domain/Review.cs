namespace Reviews.Domain;

public sealed class Review(
    Guid id,
    Guid userId,
    MediaType mediaType,
    int tmdbId,
    short rating,
    string? comment,
    DateTimeOffset createdAt,
    DateTimeOffset updatedAt,
    List<SeasonReview>? seasons = null)
{
    public Guid Id { get; } = id;

    public Guid UserId { get; } = userId;

    public MediaType MediaType { get; } = mediaType;

    public int TmdbId { get; } = tmdbId;

    public short Rating { get; set; } = rating;

    public string? Comment { get; set; } = comment;

    public DateTimeOffset CreatedAt { get; } = createdAt;

    public DateTimeOffset UpdatedAt { get; set; } = updatedAt;

    public List<SeasonReview>? Seasons { get; set; } = seasons;
}
