import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export const MAX_RATING_STARS = 5;

@Component({
  selector: 'app-rating-stars',
  imports: [MatIcon],
  templateUrl: './rating-stars.html',
  host: {
    class: 'inline-flex items-center'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingStars {
  public readonly value = input<number>(0);
  public readonly interactive = input<boolean>(false);
  public readonly ariaLabel = input<string>('Rating');

  public readonly valueChange = output<number>();

  protected readonly stars = computed<number[]>(() => Array.from({ length: MAX_RATING_STARS }, (_, index) => index + 1));

  protected setValue(star: number): void {
    this.valueChange.emit(star);
  }
}
