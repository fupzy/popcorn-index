using Authentication.Domain;
using Microsoft.AspNetCore.Identity;
using Users.Domain;
using Utilities.GuidProvider;

namespace Authentication.Application;

public sealed class AuthService(IPasswordHasher<User> passwordHasher, IUserRepository userRepository, IGuidProvider guidProvider) : IAuthService
{
    public async Task Register(string username, string password)
    {
        var user = new User(guidProvider.NewGuid(), username);

        user.PasswordHash = passwordHasher.HashPassword(user, password);

        await userRepository.Create(user);
    }

    public async Task<User?> ValidateUser(string username, string password)
    {
        var user = await userRepository.GetByUsername(username);

        if (user == null)
            return null;

        var result = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            password
        );

        return result == PasswordVerificationResult.Success ? user : null;
    }
}
