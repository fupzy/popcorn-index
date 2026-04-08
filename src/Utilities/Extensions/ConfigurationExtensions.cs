using Microsoft.Extensions.Configuration;

namespace Utilities.Extensions;

public static class ConfigurationExtensions
{
    public const string PostgreSqlSchemaProperty = "utilities:postgreSqlSchema";

    public static string GetPostgreSqlSchema(this IConfiguration configuration)
    {
        return configuration.GetValue<string>(PostgreSqlSchemaProperty) ?? "public";
    }

    public static string? GetUpdatedConnectionString(this IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("postgresql");

        if (connectionString == null)
        {
            return null;
        }

        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        var db = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "postgres";
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgrespw";
        
        connectionString = connectionString.Replace("%POSTGRES_HOST%", host);
        connectionString = connectionString.Replace("%POSTGRES_PORT%", port);
        connectionString = connectionString.Replace("%POSTGRES_DB%", db);
        connectionString = connectionString.Replace("%POSTGRES_USER%", user);
        connectionString = connectionString.Replace("%POSTGRES_PASSWORD%", password);

        return connectionString;
    }
}
