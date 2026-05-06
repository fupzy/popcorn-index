using FluentValidation;
using Reviews.Domain;

namespace Reviews.Controllers;

public abstract class ReviewCommandValidator<T> : AbstractValidator<T> where T : IReviewCommand
{
    protected ReviewCommandValidator()
    {
        this.RuleFor(x => x.Rating)
            .InclusiveBetween(SeasonReviewValidator.MinRating, SeasonReviewValidator.MaxRating)
            .WithMessage($"Rating must be between {SeasonReviewValidator.MinRating} and {SeasonReviewValidator.MaxRating}");

        this.RuleFor(x => x.Comment)
            .MaximumLength(SeasonReviewValidator.MaxCommentLength)
            .When(x => x.Comment is not null)
            .WithMessage($"Comment must be at most {SeasonReviewValidator.MaxCommentLength} characters long");

        this.RuleForEach(x => x.Seasons!)
            .SetValidator(new SeasonReviewValidator())
            .When(x => x.Seasons is not null);

        this.RuleFor(x => x.Seasons!)
            .Must(seasons => seasons.Select(s => s.SeasonNumber).Distinct().Count() == seasons.Count)
            .When(x => x.Seasons is not null)
            .WithMessage("Seasons must not contain duplicate SeasonNumber values");
    }
}
