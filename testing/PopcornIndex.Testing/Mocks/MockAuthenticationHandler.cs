using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace PopcornIndex.Testing.Mocks;

/// <summary>
/// Authenticates a test request from the <see cref="UserIdHeaderName"/> header rather than from a
/// signed JWT, so specs never have to produce a real signature. A request without that header stays
/// anonymous, which keeps the 401 paths of protected endpoints testable.
/// </summary>
internal sealed class MockAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "MockAuthentication";

    public const string UserIdHeaderName = "X-Mock-User-Id";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!this.Request.Headers.TryGetValue(UserIdHeaderName, out var userId))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()) };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName));

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName)));
    }
}
