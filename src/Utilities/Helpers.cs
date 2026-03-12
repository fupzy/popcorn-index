using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace Utilities;

public static class Helpers
{
    /// <summary>
    /// Retrieves all implementations of the specified type <typeparamref name="T"/> found in the application's
    /// loaded dependencies by scanning assemblies at runtime.
    /// </summary>
    public static IEnumerable<T> GetImplementationsOf<T>()
    {
        var collection = new ServiceCollection();
        collection.Scan(scan => scan
            .FromApplicationDependencies()
            .AddClasses(c => c.AssignableTo<T>(), false)
            .AsImplementedInterfaces()
            .WithSingletonLifetime());
        return collection.BuildServiceProvider().GetServices<T>();
    }

    /// <summary>
    /// Scans all assemblies referenced by the application and returns the assemblies that contain
    /// at least one class assignable to the specified type <typeparamref name="T"/>.
    /// </summary>
    public static IEnumerable<Assembly> GetAllReferencedAssembliesWithTypeAssignableTo<T>()
    {
        var collection = new ServiceCollection();
        collection.Scan(scan => scan.FromApplicationDependencies().AddClasses(c => c.AssignableTo<T>()));

        return collection.Select(t => t.ServiceType.Assembly).Distinct();
    }

    /// <summary>
    /// Retrieves the full path to the application's configuration files folder.
    /// </summary>
    public static string GetConfigFilesFolder()
    {
        var basePath = Environment.ExpandEnvironmentVariables(Environment.GetEnvironmentVariable("APPSETTINGS_FOLDER") ?? string.Empty);
        return Directory.Exists(basePath) ? Path.GetFullPath(basePath) : Directory.GetCurrentDirectory();
    }

    /// <summary>
    /// Reads a <c>.env</c> file specified by the <c>ENV_FILE</c> environment variable
    /// and loads its variables into the current process environment.
    /// </summary>
    public static void ReadEnvFileIfExists()
    {
        var envFile = Environment.GetEnvironmentVariable("ENV_FILE") ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(envFile) && File.Exists(envFile))
        {
            foreach (var line in File.ReadAllLines(envFile))
            {
                var parts = line.Split('=');
                if (parts.Length >= 2)
                {
                    var value = Environment.ExpandEnvironmentVariables(string.Join('=', parts.Skip(1)));
                    Environment.SetEnvironmentVariable(parts[0], value);
                }
            }
        }
    }
}
