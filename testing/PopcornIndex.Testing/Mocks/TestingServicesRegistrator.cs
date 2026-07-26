using Authentication.Domain;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
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

        // Takes over the default scheme registered by the Authentication feature, so protected
        // endpoints are reached with a mock identity instead of a signed bearer token.
        services
            .AddAuthentication(MockAuthenticationHandler.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, MockAuthenticationHandler>(MockAuthenticationHandler.SchemeName, _ => { });

        services.AddSingleton<MockTmdbHandler>();
        services.AddHttpClient(Options.DefaultName)
            .ConfigurePrimaryHttpMessageHandler<MockTmdbHandler>();

        return services;
    }
}
