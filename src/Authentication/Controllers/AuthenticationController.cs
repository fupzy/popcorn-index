using Asp.Versioning;
using Authentication.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("v{version:apiVersion}/authentication")]
[ApiExplorerSettings(GroupName = "v1")]
public sealed class AuthenticationController(IAuthService authService, IJwtService jwtService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(LoginOrRegisterCommand command)
    {
        await authService.Register(command.Username, command.Password);

        return this.Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginOrRegisterCommand command)
    {
        var user = await authService.ValidateUser(command.Username, command.Password);

        if (user == null)
            return this.Unauthorized();

        var token = jwtService.GenerateToken(user);

        return this.Ok(new LoginResponse(token));
    }
}
