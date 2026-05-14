import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { Review } from '../reviews.service';
import { RatingStars } from '../rating-stars/rating-stars';

export interface ReviewSeason {
  readonly seasonNumber: number;
  readonly name: string;
}

@Component({
  selector: 'app-review-card',
  imports: [
    DatePipe,
    MatCard,
    MatCardContent,
    MatIconButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RatingStars
  ],
  templateUrl: './review-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCard {
  public readonly review = input.required<Review>();
  public readonly isOwner = input<boolean>(false);
  public readonly seasons = input<ReviewSeason[]>([]);

  public readonly editRequested = output<void>();

  protected readonly seasonRows = computed(() => {
    const seasonNamesByNumber = new Map(this.seasons().map((season) => [season.seasonNumber, season.name]));

    return (this.review().seasons ?? []).map((season) => ({
      seasonNumber: season.seasonNumber,
      name: seasonNamesByNumber.get(season.seasonNumber) ?? `Season ${season.seasonNumber}`,
      rating: season.rating,
      comment: season.comment
    }));
  });

  protected requestEdit(): void {
    this.editRequested.emit();
  }
}
