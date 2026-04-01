using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Utilities;

namespace PostgreSqlMigration;

internal class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration) => services
        .AddDbContext<MigrationDbContext>(optionsBuilder => optionsBuilder.
            UseNpgsql(configuration.GetUpdatedConnectionString(), x => x.MigrationsHistoryTable("__ef_migrations_history", configuration.GetPostgreSqlSchema()))
            .UseSnakeCaseNamingConvention())
        .AddScoped<IBeforeRun, DatabaseMigrator<MigrationDbContext>>();
}
