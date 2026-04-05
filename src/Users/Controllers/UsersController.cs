using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Users.Domain;

namespace Users.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/users")]
[ApiExplorerSettings(GroupName = "v1")]
public sealed class UsersController(IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public IAsyncEnumerable<User> GetAll() => userRepository.GetAll();
}
