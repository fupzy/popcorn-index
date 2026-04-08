using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Users.Infrastructure;
using Utilities;

namespace PostgreSqlMigration;

public class MigrationDbContext(DbContextOptions<MigrationDbContext> options, IConfiguration configuration) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(configuration.GetPostgreSqlSchema());
        UsersDbContext.CreateNewTables(modelBuilder);
    }
}
