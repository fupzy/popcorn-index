import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LoadingShell, PosterWidth, getPosterUrl } from '@shared';

import { TmdbMedia } from '../search/search.service';

import { RandomMediaService } from './random-media.service';

@Component({
  selector: 'app-home',
  imports: [LoadingShell, RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden'
  }
})
export class Home implements OnInit {
  protected readonly logoRotation = signal(0);
  protected readonly media = signal<TmdbMedia | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly posterPath = computed<string | null>(() => getPosterUrl(this.media()?.poster_path, PosterWidth.width342));
  protected readonly detailLink = computed<string | null>(() => {
    const media = this.media();

    if (media === null) {
      return null;
    }

    return media.mediaType === 'movie' ? `/movie-detail/${media.id}` : `/series-detail/${media.id}`;
  });

  private readonly randomMediaService = inject(RandomMediaService);

  public ngOnInit(): void {
    this.loadRandomMedia();
  }

  protected loadRandomMedia(): void {
    this.logoRotation.update((value) => value + 360);
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.media.set(null);

    this.randomMediaService.getRandomMedia().subscribe({
      next: (media) => {
        this.media.set(media);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load a discovery suggestion. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
