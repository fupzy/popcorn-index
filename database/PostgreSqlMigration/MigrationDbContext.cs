using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Utilities;

namespace PostgreSqlMigration;

public class MigrationDbContext : DbContext
{
  private readonly IConfiguration configuration;

    public MigrationDbContext(DbContextOptions<MigrationDbContext> options, IConfiguration configuration)
        : base(options)
    {
        this.configuration = configuration;
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(this.configuration.GetPostgreSqlSchema());
    }
}
