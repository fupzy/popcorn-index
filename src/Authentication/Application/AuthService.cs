using Authentication.Domain;
using Microsoft.AspNetCore.Identity;
using Users.Domain;
using Utilities.GuidProvider;

namespace Authentication.Application;

public sealed class AuthService(IPasswordHasher<User> passwordHasher, IUserRepository userRepository, IGuidProvider guidProvider) : IAuthService
{
    public async Task Register(string username, string password)
    {
        var user = new User(username);

        var passwordHash = passwordHasher.HashPassword(user, password);

        await userRepository.Create(new UserWithCredentials(guidProvider.NewGuid(), username, passwordHash));
    }

    public async Task<AuthenticatedUser?> ValidateUser(string username, string password)
    {
        var storedUser = await userRepository.GetUserCredentials(username);

        if (storedUser == null)
            return null;

        var result = passwordHasher.VerifyHashedPassword(
            new User(storedUser.Username),
            storedUser.PasswordHash,
            password
        );

        if (result != PasswordVerificationResult.Success)
            return null;

        return new AuthenticatedUser(storedUser.Id, storedUser.Username);
    }
}
