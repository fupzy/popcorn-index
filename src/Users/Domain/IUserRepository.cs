namespace Users.Domain;

public interface IUserRepository
{
    IAsyncEnumerable<User> GetAll();

    Task<User?> GetById(Guid id);

    Task<UserWithCredentials?> GetUserCredentials(string username);

    Task<User> Create(UserWithCredentials user);
}
