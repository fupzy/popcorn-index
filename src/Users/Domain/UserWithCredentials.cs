namespace Users.Domain;

public sealed record UserWithCredentials(Guid Id, string Username, string PasswordHash);
