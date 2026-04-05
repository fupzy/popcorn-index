namespace Users.Domain;

public interface IUserRepository
{
    IAsyncEnumerable<User> GetAll();

    Task<User?> GetByUsername(string username);
    
    Task<User> Create(User user);
}