using Microsoft.EntityFrameworkCore;
using Users.Domain;

namespace Users.Infrastructure;

internal sealed class UserDao
{
    public const string TableName = "users";

    public Guid Id { get; set; }

    public required string Username { get; set; }

    public required string PasswordHash { get; set; }

    public static void CreateModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserDao>()
            .ToTable(TableName)
            .HasKey(u => u.Id);
        modelBuilder.Entity<UserDao>()
            .Property(u => u.Id)
            .ValueGeneratedNever();
    }

    public User ToEntity()
    {
        return new User(this.Id, this.Username, this.PasswordHash);
    }
}
