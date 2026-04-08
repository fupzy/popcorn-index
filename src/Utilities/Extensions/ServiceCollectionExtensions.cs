using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Utilities.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Automatically discovers and registers application services by scanning for all implementations
    /// of the specified <typeparamref name="T"/> type, which must implement <see cref="IBaseServicesRegistrator"/>.
    /// </summary>
    public static IServiceCollection AddApplicationServices<T>(this IServiceCollection services, IConfiguration configuration)
        where T : IBaseServicesRegistrator
    {
        var registrators = Helpers.GetImplementationsOf<T>();
        foreach (var registrator in registrators)
        {
            registrator.Add(services, configuration);
        }

        return services;
    }

    /// <summary>
    /// Scans all application assemblies and registers all concrete implementations of <see cref="IBeforeRun"/>
    /// into the dependency injection container with a scoped lifetime.
    /// </summary>
    public static IServiceCollection AddBeforeRunImplementations(this IServiceCollection services, IConfiguration configuration)
    {
        services.Scan(scan => scan
            .FromApplicationDependencies()
            .AddClasses(c => c.AssignableTo<IBeforeRun>().Where(t => !t.IsAbstract && !t.IsGenericTypeDefinition), false) // Only concrete implementations.
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
