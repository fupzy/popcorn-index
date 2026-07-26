using Authentication.Domain;

namespace PopcornIndex.Testing.Mocks;

public sealed class MockJwtService : IJwtService
{
    public readonly Dictionary<string, string> tokens = [];

    public string GenerateToken(AuthenticatedUser user)
    {
        if (this.tokens.TryGetValue(user.Username, out var value))
        {
            return value;
        }

        return string.Empty;
    }
}
