using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reviews.Infrastructure;
using Utilities;

namespace Reviews.Domain;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration) => services.AddScoped<IReviewRepository, ReviewRepository>();
}
