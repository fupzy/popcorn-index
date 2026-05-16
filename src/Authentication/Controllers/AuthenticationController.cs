using Asp.Versioning;
using Authentication.Domain;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Utilities.Extensions;

namespace Authentication.Controllers;

[ApiController]
[ApiVersion(1.0)]
[Route("api/v{version:apiVersion}/authentication")]
[ApiExplorerSettings(GroupName = "v1")]
public sealed class AuthenticationController(
    IAuthService authService,
    IJwtService jwtService,
    IValidator<LoginOrRegisterCommand> loginOrRegisterCommandValidator) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] LoginOrRegisterCommand command)
    {
        var validationResult = await loginOrRegisterCommandValidator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            validationResult.AddToModelState(this.ModelState);
            return this.ValidationProblem(this.ModelState);
        }

        try
        {
            await authService.Register(command.Username, command.Password);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            this.ModelState.AddModelError(nameof(command.Username), "Username already taken");
            return this.ValidationProblem(this.ModelState);
        }

        return this.Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginOrRegisterCommand command)
    {
        var validationResult = await loginOrRegisterCommandValidator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            validationResult.AddToModelState(this.ModelState);
            return this.ValidationProblem(this.ModelState);
        }

        var user = await authService.ValidateUser(command.Username, command.Password);

        if (user == null)
            return this.Unauthorized();

        var token = jwtService.GenerateToken(user);

        return this.Ok(new LoginResponse(token));
    }
}
