using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Utilities;

namespace Users.Infrastructure;

internal sealed class UsersDbContext(DbContextOptions<UsersDbContext> options, IConfiguration configuration): DbContext(options)
{
    public required DbSet<UserDao> Users { get; set; }

    public static void CreateNewTables(ModelBuilder modelBuilder)
    {
        UserDao.CreateModel(modelBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(configuration.GetPostgreSqlSchema());
        CreateNewTables(modelBuilder);
    }
}
