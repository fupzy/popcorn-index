namespace Authentication.Domain;

public sealed record LoginOrRegisterCommand(string Username, string Password);
