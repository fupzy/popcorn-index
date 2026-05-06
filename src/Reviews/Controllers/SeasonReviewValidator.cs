using FluentValidation;
using Reviews.Domain;

namespace Reviews.Controllers;

public sealed class SeasonReviewValidator : AbstractValidator<SeasonReview>
{
    public const short MinRating = 0;
    public const short MaxRating = 10;
    public const int MaxCommentLength = 5000;

    public SeasonReviewValidator()
    {
        this.RuleFor(x => x.SeasonNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("SeasonNumber must be >= 1");

        this.RuleFor(x => x.Rating)
            .InclusiveBetween(MinRating, MaxRating)
            .WithMessage($"Rating must be between {MinRating} and {MaxRating}");

        this.RuleFor(x => x.Comment)
            .MaximumLength(MaxCommentLength)
            .When(x => x.Comment is not null)
            .WithMessage($"Comment must be at most {MaxCommentLength} characters long");
    }
}
