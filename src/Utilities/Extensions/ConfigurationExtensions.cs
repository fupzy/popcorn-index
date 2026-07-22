using System.Text;
using Microsoft.Extensions.Configuration;

namespace Utilities.Extensions;

public static class ConfigurationExtensions
{
    public const string PostgreSqlSchemaProperty = "utilities:postgreSqlSchema";

    // HMAC-SHA256 requires a key of at least 256 bits (32 bytes).
    private const int MinimumJwtKeyBytes = 32;

    public static string GetPostgreSqlSchema(this IConfiguration configuration)
    {
        return configuration.GetValue<string>(PostgreSqlSchemaProperty) ?? "public";
    }

    public static string GetJwtSigningKey(this IConfiguration configuration)
    {
        var key = Environment.GetEnvironmentVariable("JWT_KEY");

        if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < MinimumJwtKeyBytes)
        {
            throw new InvalidOperationException("The JWT_KEY environment variable is missing or shorter than 32 bytes.");
        }

        return key;
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
