import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TmdbGenre {
  readonly id: number;
  readonly name: string;
}

export interface TmdbMovieDetails {
  readonly id: number;
  readonly title: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly release_date: string;
  readonly vote_average: number;
  readonly runtime: number | null;
  readonly tagline: string;
  readonly genres: TmdbGenre[];
}

export interface TmdbSeriesDetails {
  readonly id: number;
  readonly name: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly first_air_date: string;
  readonly vote_average: number;
  readonly number_of_seasons: number;
  readonly tagline: string;
  readonly genres: TmdbGenre[];
}

/**
 * Fetches detailed information for a single movie or TV series
 * through the backend TMDB proxy at `/api/v1/tmdb`.
 */
@Injectable({ providedIn: 'root' })
export class MediaDetailService {
  private readonly baseUrl = '/popcorn-index/api/v1/tmdb';

  private readonly httpClient = inject(HttpClient);

  public getMovieDetails(id: string): Observable<TmdbMovieDetails> {
    return this.httpClient.get<TmdbMovieDetails>(`${this.baseUrl}/movie/${id}`);
  }

  public getSeriesDetails(id: string): Observable<TmdbSeriesDetails> {
    return this.httpClient.get<TmdbSeriesDetails>(`${this.baseUrl}/tv/${id}`);
  }
}
