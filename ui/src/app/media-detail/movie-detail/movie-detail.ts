import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { getPosterUrl, PosterWidth } from '@shared';

import { MediaDetailService, TmdbMovieDetails } from '../media-detail.service';

@Component({
  selector: 'app-movie-detail',
  imports: [MatProgressSpinner],
  templateUrl: './movie-detail.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto p-4'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetail implements OnInit {
  public readonly id = input.required<string>();

  protected readonly movieDetails = signal<TmdbMovieDetails | null>(null);
  protected readonly posterPath = computed<string | null>(() => {
    const movieDetails = this.movieDetails();

    return getPosterUrl(movieDetails?.poster_path, PosterWidth.width500);
  });
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly mediaDetailService = inject(MediaDetailService);

  public ngOnInit(): void {
    const id = this.id();

    this.loadMovie(id);
  }

  private loadMovie(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.movieDetails.set(null);

    this.mediaDetailService.getMovieDetails(id).subscribe({
      next: (details) => {
        this.movieDetails.set(details);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
