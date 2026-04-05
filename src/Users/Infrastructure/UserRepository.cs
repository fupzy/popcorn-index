using Microsoft.EntityFrameworkCore;
using Users.Domain;

namespace Users.Infrastructure;

internal sealed class UserRepository(UsersDbContext dbContext) : IUserRepository
{
    public async Task<User> Create(User user)
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
            .Select(u => u.ToEntity());

        var items = query.AsAsyncEnumerable();

        return items;
    }

    public async Task<User?> GetByUsername(string username)
    {
        var userDao = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);

        return userDao?.ToEntity();
    }
}
