namespace Authentication.Domain;

public interface IJwtService
{
    string GenerateToken(AuthenticatedUser user);
}
