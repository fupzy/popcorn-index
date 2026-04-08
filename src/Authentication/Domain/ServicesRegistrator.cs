using Authentication.Application;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Users.Domain;
using Utilities;

namespace Authentication.Domain;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
    {
        return services
            .AddScoped<IPasswordHasher<User>, PasswordHasher<User>>()
            .AddScoped<IJwtService, JwtService>()
            .AddScoped<IAuthService, AuthService>();
    }
}
