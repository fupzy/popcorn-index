using Authentication.Domain;
using FluentValidation;

namespace Authentication.Controllers;

public sealed class LoginOrRegisterCommandValidator : AbstractValidator<LoginOrRegisterCommand>
{
    public LoginOrRegisterCommandValidator()
    {
        this.RuleFor(x => x.Username)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Username cannot be empty")
            .MinimumLength(3)
            .WithMessage("Username must be at least 3 characters long");

        this.RuleFor(x => x.Password)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Password cannot be empty")
            .MinimumLength(6)
            .WithMessage("Password must be at least 6 characters long");
    }
}
