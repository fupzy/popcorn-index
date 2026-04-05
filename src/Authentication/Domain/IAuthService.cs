using Users.Domain;

namespace Authentication.Domain;

public interface IAuthService
{
    Task<User?> ValidateUser(string username, string password);

    Task Register(string username, string password);
}
