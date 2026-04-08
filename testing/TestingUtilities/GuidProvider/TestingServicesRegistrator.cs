using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Utilities.GuidProvider;

namespace TestingUtilities.GuidProvider;

internal sealed class TestingServicesRegistrator : ITestingServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
    {
        services.Replace(new ServiceDescriptor(typeof(IGuidProvider), new MockGuidProvider()));

        return services;
    }
}
