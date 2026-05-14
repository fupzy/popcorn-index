namespace Users.Domain;

public interface IUserRepository
{
    IAsyncEnumerable<User> GetAll();

    Task<User?> GetByUsername(string username);

    Task<User?> GetById(Guid id);

    Task<User> Create(User user);
}