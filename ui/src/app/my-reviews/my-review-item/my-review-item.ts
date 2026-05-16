import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { MediaDetailService } from '../../media-detail/media-detail.service';
import { Review } from '../../reviews/reviews.service';
import { ReviewCard } from '../../reviews/review-card/review-card';

@Component({
  selector: 'app-my-review-item',
  imports: [RouterLink, MatIcon, ReviewCard],
  templateUrl: './my-review-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyReviewItem {
  public readonly review = input.required<Review>();

  protected readonly mediaLink = computed(() => {
    const review = this.review();
    const base = review.mediaType === 'Movie' ? '/movie-detail' : '/series-detail';

    return [base, review.tmdbId];
  });

  protected readonly mediaTypeLabel = computed(() => (this.review().mediaType === 'Movie' ? 'Movie' : 'Series'));

  protected readonly mediaTitle = signal<string | null>(null);

  private readonly mediaDetailService = inject(MediaDetailService);

  constructor() {
    effect(() => {
      const review = this.review();

      this.mediaTitle.set(null);

      if (review.mediaType === 'Movie') {
        this.mediaDetailService.getMovieDetails(String(review.tmdbId)).subscribe({ next: (details) => this.mediaTitle.set(details.title) });
      } else {
        this.mediaDetailService.getSeriesDetails(String(review.tmdbId)).subscribe({ next: (details) => this.mediaTitle.set(details.name) });
      }
    });
  }
}
