using Microsoft.EntityFrameworkCore;
using Reviews.Domain;
using Utilities.GuidProvider;

namespace Reviews.Infrastructure;

internal sealed class ReviewRepository(ReviewsDbContext dbContext, IGuidProvider guidProvider) : IReviewRepository
{
    public IAsyncEnumerable<Review> GetMediaReviews(MediaType mediaType, int tmdbId)
    {
        return dbContext.Reviews
            .AsNoTracking()
            .Include(r => r.Seasons)
            .Where(r => r.MediaType == mediaType && r.TmdbId == tmdbId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => r.ToEntity())
            .AsAsyncEnumerable();
    }

    public IAsyncEnumerable<Review> GetUserReviews(Guid userId)
    {
        return dbContext.Reviews
            .AsNoTracking()
            .Include(r => r.Seasons)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => r.ToEntity())
            .AsAsyncEnumerable();
    }

    public async Task<Review?> GetUserMediaReview(Guid userId, MediaType mediaType, int tmdbId)
    {
        var dao = await dbContext.Reviews
            .AsNoTracking()
            .Include(r => r.Seasons)
            .FirstOrDefaultAsync(r => r.UserId == userId && r.MediaType == mediaType && r.TmdbId == tmdbId);

        return dao?.ToEntity();
    }

    public async Task<Review> Create(CreateReviewCommand command)
    {
        var id = guidProvider.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var dao = new ReviewDao
        {
            Id = id,
            UserId = command.UserId,
            MediaType = command.MediaType,
            TmdbId = command.TmdbId,
            Rating = command.Rating,
            Comment = command.Comment,
            CreatedAt = now,
            UpdatedAt = now,
            Seasons = command.Seasons?
                .Select(s => new SeasonReviewDao
                {
                    ReviewId = id,
                    SeasonNumber = s.SeasonNumber,
                    Rating = s.Rating,
                    Comment = s.Comment,
                })
                .ToList() ?? [],
        };

        await dbContext.Reviews.AddAsync(dao);
        await dbContext.SaveChangesAsync();

        return dao.ToEntity();
    }

    public async Task<Review?> Update(Guid id, UpdateReviewCommand command)
    {
        var existing = await dbContext.Reviews
            .Include(r => r.Seasons)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (existing is null)
            return null;

        existing.Rating = command.Rating;
        existing.Comment = command.Comment;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        dbContext.RemoveRange(existing.Seasons);
        existing.Seasons = command.Seasons?
            .Select(s => new SeasonReviewDao
            {
                ReviewId = existing.Id,
                SeasonNumber = s.SeasonNumber,
                Rating = s.Rating,
                Comment = s.Comment,
            })
            .ToList() ?? [];

        await dbContext.SaveChangesAsync();
        return existing.ToEntity();
    }
}
