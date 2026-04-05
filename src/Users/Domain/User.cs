namespace Users.Domain;

public sealed class User(Guid id, string username, string passwordHash = "")
{
    public Guid Id { get; } = id;

    public string Username { get; } = username;

    public string PasswordHash { get; set; } = passwordHash;
}