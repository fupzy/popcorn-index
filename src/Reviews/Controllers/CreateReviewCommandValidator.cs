using FluentValidation;
using Reviews.Domain;

namespace Reviews.Controllers;

public sealed class CreateReviewCommandValidator : ReviewCommandValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        this.RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId is required");

        this.RuleFor(x => x.MediaType)
            .IsInEnum()
            .WithMessage("MediaType must be Movie or Series");

        this.RuleFor(x => x.TmdbId)
            .GreaterThan(0)
            .WithMessage("TmdbId must be > 0");

        this.RuleFor(x => x.Seasons)
            .Null()
            .When(x => x.MediaType == MediaType.Movie)
            .WithMessage("Movies cannot have season reviews");
    }
}
