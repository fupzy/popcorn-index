using System.Text;
using Authentication.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Users.Domain;
using Utilities;
using Utilities.Extensions;

namespace Authentication.Domain;

internal sealed class ServicesRegistrator : IServicesRegistrator
{
    public IServiceCollection Add(IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // Keep the "sub" claim under its own name instead of remapping it to the
                // legacy nameidentifier URI, so ClaimsPrincipalExtensions.GetUserId matches
                // the claim JwtService emits.
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetJwtSigningKey())),
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization();

        return services
            .AddScoped<IPasswordHasher<User>, PasswordHasher<User>>()
            .AddScoped<IJwtService, JwtService>()
            .AddScoped<IAuthService, AuthService>();
    }
}
