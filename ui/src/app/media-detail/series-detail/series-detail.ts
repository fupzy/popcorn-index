import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelContent,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

import { BackButton, getPosterUrl, LoadingShell, PosterWidth } from '@shared';

import { MediaDetailService, TmdbSeriesDetails } from '../media-detail.service';

import { SeasonDetail } from './season-detail/season-detail';

@Component({
  selector: 'app-series-detail',
  imports: [
    BackButton,
    LoadingShell,
    SeasonDetail,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionPanelContent
  ],
  templateUrl: './series-detail.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto p-4'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeriesDetail implements OnInit {
  public readonly id = input.required<string>();

  protected readonly seriesDetails = signal<TmdbSeriesDetails | null>(null);
  protected readonly posterPath = computed<string | null>(() => {
    const seriesDetails = this.seriesDetails();

    return getPosterUrl(seriesDetails?.poster_path, PosterWidth.width500);
  });
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly mediaDetailService = inject(MediaDetailService);

  public ngOnInit(): void {
    const id = this.id();

    this.loadSeries(id);
  }

  private loadSeries(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.seriesDetails.set(null);

    this.mediaDetailService.getSeriesDetails(id).subscribe({
      next: (details) => {
        this.seriesDetails.set(details);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
