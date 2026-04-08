using Authentication.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TestingUtilities;
using Users.Domain;

namespace PopcornIndex.Testing.Mocks;

internal sealed class TestingServicesRegistrator : ITestingServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
    {
        services
            .Replace(new ServiceDescriptor(typeof(IPasswordHasher<User>), new MockPasswordHasher()))
            .Replace(new ServiceDescriptor(typeof(IJwtService), new MockJwtService()));

        return services;
    }
}
