import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { Review, ReviewMediaType, ReviewsService, SeasonReview } from '../reviews.service';
import { ReviewSeason } from '../review-card/review-card';
import { MAX_RATING_STARS, RatingStars } from '../rating-stars/rating-stars';

export interface ReviewFormDialogData {
  readonly mediaType: ReviewMediaType;
  readonly tmdbId: number;
  readonly userId: string;
  readonly seasons: ReviewSeason[];
  readonly existingReview: Review | null;
}

interface SeasonFormGroup {
  rating: FormControl<number>;
  comment: FormControl<string>;
}

interface SeasonFormEntry {
  season: ReviewSeason;
  form: FormGroup<SeasonFormGroup>;
}

interface ReviewFormGroup {
  rating: FormControl<number>;
  comment: FormControl<string>;
}

const MAX_COMMENT_LENGTH = 5000;

@Component({
  selector: 'app-review-form-dialog',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatFormField, MatLabel, MatInput, RatingStars],
  templateUrl: './review-form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewFormDialog {
  protected readonly data = inject<ReviewFormDialogData>(MAT_DIALOG_DATA);
  protected readonly maxCommentLength = MAX_COMMENT_LENGTH;
  protected readonly isEditing = computed(() => this.data.existingReview !== null);

  protected readonly form: FormGroup<ReviewFormGroup>;
  protected readonly seasonForms: SeasonFormEntry[];

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly dialogRef = inject<MatDialogRef<ReviewFormDialog, Review | null>>(MatDialogRef);
  private readonly reviewsService = inject(ReviewsService);
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  constructor() {
    const existing = this.data.existingReview;

    this.form = this.formBuilder.group<ReviewFormGroup>({
      rating: this.formBuilder.control(existing?.rating ?? 0, [Validators.required, Validators.min(1), Validators.max(MAX_RATING_STARS)]),
      comment: this.formBuilder.control(existing?.comment ?? '', [Validators.maxLength(MAX_COMMENT_LENGTH)])
    });

    this.seasonForms = this.data.seasons.map((season) => {
      const existingSeason = existing?.seasons?.find((s) => s.seasonNumber === season.seasonNumber);

      return {
        season,
        form: this.formBuilder.group<SeasonFormGroup>({
          rating: this.formBuilder.control(existingSeason?.rating ?? 0, [Validators.min(0), Validators.max(MAX_RATING_STARS)]),
          comment: this.formBuilder.control(existingSeason?.comment ?? '', [Validators.maxLength(MAX_COMMENT_LENGTH)])
        })
      };
    });
  }

  protected setRating(value: number): void {
    this.form.controls.rating.setValue(value);
    this.form.controls.rating.markAsTouched();
  }

  protected setSeasonRating(entry: SeasonFormEntry, value: number): void {
    entry.form.controls.rating.setValue(value);
    entry.form.controls.rating.markAsTouched();
  }

  protected submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();

      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const seasons = this.collectSeasons();
    const rating = this.form.controls.rating.value;
    const comment = this.normalizeComment(this.form.controls.comment.value);
    const existing = this.data.existingReview;

    const request$ =
      existing === null
        ? this.reviewsService.createReview({
            userId: this.data.userId,
            mediaType: this.data.mediaType,
            tmdbId: this.data.tmdbId,
            rating,
            comment,
            seasons
          })
        : this.reviewsService.updateReview(existing.id, { rating, comment, seasons });

    request$.subscribe({
      next: (review) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(review);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Unable to save your review. Please try again.');
      }
    });
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  private collectSeasons(): SeasonReview[] | null {
    if (this.seasonForms.length === 0) {
      return null;
    }

    const seasons = this.seasonForms
      .filter((entry) => entry.form.controls.rating.value > 0)
      .map<SeasonReview>((entry) => ({
        seasonNumber: entry.season.seasonNumber,
        rating: entry.form.controls.rating.value,
        comment: this.normalizeComment(entry.form.controls.comment.value)
      }));

    return seasons.length === 0 ? null : seasons;
  }

  private normalizeComment(value: string): string | null {
    const trimmed = value.trim();

    return trimmed.length === 0 ? null : trimmed;
  }
}
