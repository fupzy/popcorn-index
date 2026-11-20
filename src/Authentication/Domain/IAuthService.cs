namespace Authentication.Domain;

public interface IAuthService
{
    Task<AuthenticatedUser?> ValidateUser(string username, string password);

    Task Register(string username, string password);
}
