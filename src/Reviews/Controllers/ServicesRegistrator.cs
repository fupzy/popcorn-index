using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reviews.Domain;
using Utilities;

namespace Reviews.Controllers;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
        => services
            .AddScoped<IValidator<CreateReviewCommand>, CreateReviewCommandValidator>()
            .AddScoped<IValidator<UpdateReviewCommand>, UpdateReviewCommandValidator>();
}
