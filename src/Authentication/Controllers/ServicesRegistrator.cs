using Authentication.Domain;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Utilities;

namespace Authentication.Controllers;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
        => services.AddScoped<IValidator<LoginOrRegisterCommand>, LoginOrRegisterCommandValidator>();
}
