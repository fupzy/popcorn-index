using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Utilities.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Reads the authenticated user's id from the <c>sub</c> claim of the validated token.
    /// Returns <c>null</c> when the caller is anonymous or carries no parsable subject —
    /// never trust a user id coming from a request body instead.
    /// </summary>
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        var subject = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(subject, out var userId) ? userId : null;
    }
}
