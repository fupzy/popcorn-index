using Microsoft.EntityFrameworkCore;
using Users.Domain;

namespace Users.Infrastructure;

internal sealed class UserRepository(UsersDbContext dbContext) : IUserRepository
{
    public async Task<User> Create(UserWithCredentials user)
    {
        var userDao = new UserDao
        {
            Id = user.Id,
            Username = user.Username,
            PasswordHash = user.PasswordHash
        };

        await dbContext.Users.AddAsync(userDao);
        await dbContext.SaveChangesAsync();

        return userDao.ToEntity();
    }

    public IAsyncEnumerable<User> GetAll()
    {
        var query = dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .Select(u => new User(u.Username));

        var items = query.AsAsyncEnumerable();

        return items;
    }

    public async Task<User?> GetById(Guid id)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new User(u.Username))
            .FirstOrDefaultAsync();

        return user;
    }

    public async Task<UserWithCredentials?> GetUserCredentials(string username)
    {
        var userDao = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == username);

        return userDao?.ToUserWithCredentials();
    }
}
