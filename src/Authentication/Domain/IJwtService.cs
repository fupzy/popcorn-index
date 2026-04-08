using Users.Domain;

namespace Authentication.Domain;

public interface IJwtService
{
    string GenerateToken(User user);
}
