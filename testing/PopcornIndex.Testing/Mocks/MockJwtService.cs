using Authentication.Domain;
using Users.Domain;

namespace PopcornIndex.Testing.Mocks;

public sealed class MockJwtService : IJwtService
{
    public readonly Dictionary<string, string> tokens = [];

    public string GenerateToken(User user)
    {
        if (this.tokens.TryGetValue(user.Username, out var value))
        {
            return value;
        }

        return string.Empty;
    }
}
