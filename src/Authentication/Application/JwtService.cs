using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Authentication.Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Utilities.Extensions;

namespace Authentication.Application;

public sealed class JwtService(IConfiguration configuration) : IJwtService
{
    static JwtService()
    {
        // Emit the JWT registered claim names ("sub", "name") verbatim instead of
        // the legacy long XML URIs that JwtSecurityTokenHandler uses by default.
        JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();
    }

    public string GenerateToken(AuthenticatedUser user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Username)
        };

        var jwtConfigurationKey = configuration.GetJwtSigningKey();

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfigurationKey)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
