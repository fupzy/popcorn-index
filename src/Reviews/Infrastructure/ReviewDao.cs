using Microsoft.EntityFrameworkCore;
using Reviews.Domain;

namespace Reviews.Infrastructure;

internal sealed class ReviewDao
{
    public const string TableName = "reviews";

    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public MediaType MediaType { get; set; }

    public int TmdbId { get; set; }

    public short Rating { get; set; }

    public string? Comment { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public List<SeasonReviewDao> Seasons { get; set; } = [];

    public static void CreateModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ReviewDao>()
            .ToTable(TableName)
            .HasKey(r => r.Id);

        modelBuilder.Entity<ReviewDao>()
            .Property(r => r.Id)
            .ValueGeneratedNever();

        modelBuilder.Entity<ReviewDao>()
            .Property(r => r.MediaType)
            .HasConversion<string>();

        modelBuilder.Entity<ReviewDao>()
            .HasIndex(r => new { r.UserId, r.MediaType, r.TmdbId })
            .IsUnique();

        modelBuilder.Entity<ReviewDao>()
            .HasIndex(r => new { r.MediaType, r.TmdbId });

        modelBuilder.Entity<ReviewDao>()
            .HasIndex(r => r.UserId);

        modelBuilder.Entity<ReviewDao>()
            .HasMany(r => r.Seasons)
            .WithOne()
            .HasForeignKey(s => s.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public Review ToEntity()
    {
        return new Review(
            this.Id,
            this.UserId,
            this.MediaType,
            this.TmdbId,
            this.Rating,
            this.Comment,
            this.CreatedAt,
            this.UpdatedAt,
            this.MediaType == MediaType.Series ? [.. this.Seasons.Select(s => s.ToEntity())] : null);
    }
}
