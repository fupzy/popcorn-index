import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';

import { LoadingShell } from '@shared';

import { MediaDetailService, TmdbSeasonDetails } from '../../media-detail.service';

@Component({
  selector: 'app-season-detail',
  imports: [LoadingShell],
  templateUrl: './season-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonDetail implements OnInit {
  public readonly seriesId = input.required<number>();
  public readonly seasonNumber = input.required<number>();

  protected readonly seasonDetails = signal<TmdbSeasonDetails | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly mediaDetailService = inject(MediaDetailService);

  public ngOnInit(): void {
    this.loadSeason(this.seriesId(), this.seasonNumber());
  }

  private loadSeason(seriesId: number, seasonNumber: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.seasonDetails.set(null);

    this.mediaDetailService.getSeasonDetails(seriesId, seasonNumber).subscribe({
      next: (details) => {
        this.seasonDetails.set(details);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load season. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
