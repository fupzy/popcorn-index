using Npgsql;
using Reqnroll;

namespace TestingUtilities;

[Binding]
public sealed class TestingDatabaseCreator(IReqnrollOutputHelper reqnrollOutputHelper, ServiceTestingSteps serviceTestingSteps)
{
    public const int HookOrder = HookAttribute.DefaultOrder - 1000;

    /// <summary>
    /// Scenario tag we should use when we want to include temporary testing database creation.
    /// </summary>
    public const string TargetTag = "postgresql";

    private readonly string databaseName = $"popcorn_index_{Guid.NewGuid()}";

    private string? connectionString;

    /// <summary>
    /// Before scenario hook that creates a new PostgreSQL database and sets the connection string
    /// in the test arguments so the application under test uses the temporary database.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    [BeforeScenario(TargetTag, Order = HookOrder)]
    public async Task DatabaseCreation()
    {
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgrespw";
        var db = "postgres";

        this.connectionString = $"server={host};port={port};database={db};userId={user};password={password};";
        NpgsqlConnection.ClearAllPools();
        using var connection = new NpgsqlConnection(this.connectionString);
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        reqnrollOutputHelper.WriteLine($"[TestingDatabaseCreator] Creating database {this.databaseName}...");
        command.CommandText = $"CREATE DATABASE \"{this.databaseName}\"";
        await command.ExecuteNonQueryAsync(); // Executes a request that does not return data
        await connection.CloseAsync();
        reqnrollOutputHelper.WriteLine($"[TestingDatabaseCreator] Database {this.databaseName} created.");

        var targetConnectionString = $"server={host};port={port};database={this.databaseName};userId={user};password={password};";
        serviceTestingSteps.Args.Add($"--ConnectionStrings:Postgresql={targetConnectionString}");
    }

    /// <summary>
    /// After scenario hook that drops the temporary PostgreSQL database created for the scenario.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    [AfterScenario(TargetTag)]
    public async Task DeleteDatabase()
    {
        reqnrollOutputHelper.WriteLine($"[TestingDatabaseCreator] Deleting database {this.databaseName}...");
        NpgsqlConnection.ClearAllPools();
        using var connection = new NpgsqlConnection(this.connectionString);
        await connection.OpenAsync();
        using var command = connection.CreateCommand();
        command.CommandText = $"DROP DATABASE \"{this.databaseName}\"";
        await command.ExecuteNonQueryAsync();
        await connection.CloseAsync();
        reqnrollOutputHelper.WriteLine($"[TestingDatabaseCreator] Database {this.databaseName} deleted.");
    }
}
