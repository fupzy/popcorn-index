using Microsoft.AspNetCore.Identity;
using Users.Domain;

namespace PopcornIndex.Testing.Mocks;

internal class MockPasswordHasher : IPasswordHasher<User>
{
    public string HashPassword(User user, string password)
    {
        return $"{user.Username}_{password}";
    }

    public PasswordVerificationResult VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
    {
        var expectedHash = $"{user.Username}_{providedPassword}";
        return expectedHash == hashedPassword ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
    }
}
