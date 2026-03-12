using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MockFeature.Domain;
using Utilities;

namespace MockFeature.Infrastructure;

internal class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration) => services.AddScoped<IItemRepository, ItemRepository>();
}
