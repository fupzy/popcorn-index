using Microsoft.EntityFrameworkCore;
using Reviews.Domain;

namespace Reviews.Infrastructure;

internal sealed class SeasonReviewDao
{
    public const string TableName = "season_reviews";

    public Guid ReviewId { get; set; }

    public int SeasonNumber { get; set; }

    public short Rating { get; set; }

    public string? Comment { get; set; }

    public static void CreateModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SeasonReviewDao>()
            .ToTable(TableName)
            .HasKey(s => new { s.ReviewId, s.SeasonNumber });
    }

    public SeasonReview ToEntity()
    {
        return new SeasonReview(this.SeasonNumber, this.Rating, this.Comment);
    }
}
