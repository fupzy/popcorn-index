using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Utilities.Extensions;

namespace Reviews.Infrastructure;

internal sealed class ReviewsDbContext(DbContextOptions<ReviewsDbContext> options, IConfiguration configuration) : DbContext(options)
{
    public required DbSet<ReviewDao> Reviews { get; set; }

    public required DbSet<SeasonReviewDao> SeasonReviews { get; set; }

    public static void CreateNewTables(ModelBuilder modelBuilder)
    {
        ReviewDao.CreateModel(modelBuilder);
        SeasonReviewDao.CreateModel(modelBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(configuration.GetPostgreSqlSchema());
        CreateNewTables(modelBuilder);
    }
}
