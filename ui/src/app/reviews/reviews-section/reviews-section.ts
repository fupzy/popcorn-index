import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthenticationService } from '../../authentication/authentication.service';
import { Review, ReviewMediaType, ReviewsService } from '../reviews.service';
import { RatingStars } from '../rating-stars/rating-stars';
import { ReviewCard, ReviewSeason } from '../review-card/review-card';
import { ReviewFormDialog, ReviewFormDialogData } from '../review-form-dialog/review-form-dialog';

type SortOrder = 'recent' | 'top';

interface AverageRating {
  readonly value: number;
  readonly rounded: number;
  readonly count: number;
}

@Component({
  selector: 'app-reviews-section',
  imports: [MatButton, MatButtonToggle, MatButtonToggleGroup, MatIcon, MatProgressSpinner, RatingStars, ReviewCard],
  templateUrl: './reviews-section.html',
  host: {
    class: 'block mt-8'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsSection implements OnInit {
  public readonly mediaType = input.required<ReviewMediaType>();
  public readonly tmdbId = input.required<number>();
  public readonly seasons = input<ReviewSeason[]>([]);

  protected readonly reviews = signal<Review[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly sortOrder = signal<SortOrder>('recent');

  protected readonly currentUserId = computed(() => this.authenticationService.currentUserId());

  protected readonly ownReview = computed<Review | null>(() => {
    const userId = this.currentUserId();

    if (userId === null) {
      return null;
    }

    return this.reviews().find((review) => review.userId === userId) ?? null;
  });

  protected readonly otherReviews = computed<Review[]>(() => {
    const userId = this.currentUserId();
    const others = userId === null ? this.reviews().slice() : this.reviews().filter((review) => review.userId !== userId);

    return this.sortOrder() === 'top'
      ? others.sort((a, b) => b.rating - a.rating || Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      : others.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  });

  protected readonly averageRating = computed<AverageRating | null>(() => {
    const all = this.reviews();

    if (all.length === 0) {
      return null;
    }

    const total = all.reduce((sum, review) => sum + review.rating, 0);
    const value = Math.round((total / all.length) * 10) / 10;

    return { value, rounded: Math.round(value), count: all.length };
  });

  private readonly reviewsService = inject(ReviewsService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);

  public ngOnInit(): void {
    this.loadReviews();
  }

  protected setSortOrder(order: SortOrder): void {
    this.sortOrder.set(order);
  }

  protected openForm(userId: string): void {
    const data: ReviewFormDialogData = {
      mediaType: this.mediaType(),
      tmdbId: this.tmdbId(),
      userId,
      seasons: this.seasons(),
      existingReview: this.ownReview()
    };

    const dialogRef = this.dialog.open<ReviewFormDialog, ReviewFormDialogData, Review | null>(ReviewFormDialog, {
      data,
      width: '560px',
      maxWidth: '90vw',
      autoFocus: 'first-tabbable'
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.upsertReview(saved);
      }
    });
  }

  private loadReviews(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const tmdbId = this.tmdbId();
    const request$ = this.mediaType() === 'Movie' ? this.reviewsService.getMovieReviews(tmdbId) : this.reviewsService.getSeriesReviews(tmdbId);

    request$.subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load reviews. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private upsertReview(review: Review): void {
    this.reviews.update((current) => {
      const index = current.findIndex((existing) => existing.id === review.id);

      if (index === -1) {
        return [review, ...current];
      }

      const next = current.slice();
      next[index] = review;

      return next;
    });
  }
}
