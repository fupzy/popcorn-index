import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MediaType, RawMovieResult, RawTmdbResponse, RawTvResult, TmdbMedia, movieToMedia, tvToMedia } from '../search/search.service';

const pickRandom = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * Fetches a random trending movie or series through the backend TMDB proxy.
 * Used by the Home page to surface discovery content to the user.
 */
@Injectable({ providedIn: 'root' })
export class RandomMediaService {
  private readonly baseUrl = '/popcorn-index/api/v1/tmdb';

  private readonly httpClient = inject(HttpClient);

  public getRandomMedia(): Observable<TmdbMedia | null> {
    const mediaType: MediaType = Math.random() < 0.5 ? 'movie' : 'tv';

    if (mediaType === 'movie') {
      return this.fetchRandomMovie();
    }

    return this.fetchRandomSeries();
  }

  private fetchRandomMovie(): Observable<TmdbMedia | null> {
    return this.httpClient
      .get<RawTmdbResponse<RawMovieResult>>(`${this.baseUrl}/trending/movie/week`)
      .pipe(map((response) => (response.results.length > 0 ? movieToMedia(pickRandom(response.results)) : null)));
  }

  private fetchRandomSeries(): Observable<TmdbMedia | null> {
    return this.httpClient
      .get<RawTmdbResponse<RawTvResult>>(`${this.baseUrl}/trending/tv/week`)
      .pipe(map((response) => (response.results.length > 0 ? tvToMedia(pickRandom(response.results)) : null)));
  }
}
