import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthenticationService } from '../authentication/authentication.service';
import { Review, ReviewsService } from '../reviews/reviews.service';
import { MyReviewItem } from './my-review-item/my-review-item';

@Component({
  selector: 'app-my-reviews',
  imports: [MatCard, MatCardContent, MatProgressSpinner, MyReviewItem],
  templateUrl: './my-reviews.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyReviews implements OnInit {
  protected readonly reviews = signal<Review[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly sortedReviews = computed(() =>
    this.reviews()
      .slice()
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  );

  private readonly reviewsService = inject(ReviewsService);
  private readonly authenticationService = inject(AuthenticationService);

  public ngOnInit(): void {
    const userId = this.authenticationService.currentUserId() as string;

    this.isLoading.set(true);
    this.reviewsService.getUserReviews(userId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load your reviews. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
