using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Utilities;

public class DatabaseMigrator<T>(T migrationContext, ILogger<DatabaseMigrator<T>> logger) : IBeforeRun
    where T : DbContext
{
    public async Task Execute()
    {
        var migrateDatabaseEnvValue = Environment.GetEnvironmentVariable("MIGRATE_DATABASE");
        if (bool.TryParse(migrateDatabaseEnvValue, out var migrateDatabase) && migrateDatabase)
        {
            logger.LogInformation("Database migration is enabled.");
            var connectionString = migrationContext.Database.GetDbConnection().ConnectionString;
            logger.LogInformation("Migrating database {ConnectionString}...", connectionString);
            await migrationContext.Database.MigrateAsync();
        }
        else
        {
            logger.LogInformation("Database migration is disabled.");
        }
    }
}
