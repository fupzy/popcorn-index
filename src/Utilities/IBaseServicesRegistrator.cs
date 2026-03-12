using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Utilities;

public interface IBaseServicesRegistrator
{
    IServiceCollection Add(IServiceCollection services, IConfiguration configuration);
}
