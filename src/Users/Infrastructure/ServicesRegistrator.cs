using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Utilities;

namespace Users.Infrastructure;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
    {
        return services.AddDbContext<UsersDbContext>(
            optionsBuilder => optionsBuilder.UseNpgsql(configuration.GetUpdatedConnectionString(), options => options.EnableRetryOnFailure()).UseSnakeCaseNamingConvention());
    }
}
