using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Reviews.Infrastructure;
using Users.Infrastructure;
using Utilities.Extensions;

namespace PostgreSqlMigration;

public class MigrationDbContext(DbContextOptions<MigrationDbContext> options, IConfiguration configuration) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(configuration.GetPostgreSqlSchema());
        UsersDbContext.CreateNewTables(modelBuilder);
        ReviewsDbContext.CreateNewTables(modelBuilder);
    }
}
