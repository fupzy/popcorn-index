import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export const MAX_RATING_STARS = 5;
export const MAX_RATING_VALUE = MAX_RATING_STARS * 2;

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

  protected readonly hoverValue = signal<number | null>(null);

  protected readonly displayedValue = computed(() => this.hoverValue() ?? this.value());

  protected iconFor(star: number): string {
    const current = this.displayedValue();

    if (current >= star * 2) {
      return 'star';
    }

    if (current >= star * 2 - 1) {
      return 'star_half';
    }

    return 'star_border';
  }

  protected halfLabel(star: number): string {
    return `${star - 0.5} stars`;
  }

  protected fullLabel(star: number): string {
    return `${star} star${star === 1 ? '' : 's'}`;
  }

  protected setValue(value: number): void {
    this.valueChange.emit(value);
  }

  protected previewValue(value: number): void {
    this.hoverValue.set(value);
  }

  protected clearPreview(): void {
    this.hoverValue.set(null);
  }
}
