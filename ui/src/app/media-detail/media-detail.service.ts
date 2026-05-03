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

export interface TmdbSeason {
  readonly id: number;
  readonly season_number: number;
  readonly name: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly air_date: string | null;
  readonly episode_count: number;
  readonly vote_average: number;
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
  readonly seasons: TmdbSeason[];
}

export interface TmdbEpisode {
  readonly id: number;
  readonly episode_number: number;
  readonly name: string;
  readonly overview: string;
  readonly still_path: string | null;
  readonly air_date: string;
  readonly runtime: number | null;
  readonly vote_average: number;
}

export interface TmdbSeasonDetails {
  readonly id: number;
  readonly season_number: number;
  readonly name: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly air_date: string | null;
  readonly episodes: TmdbEpisode[];
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

  public getSeasonDetails(seriesId: number, seasonNumber: number): Observable<TmdbSeasonDetails> {
    return this.httpClient.get<TmdbSeasonDetails>(`${this.baseUrl}/tv/${seriesId}/season/${seasonNumber}`);
  }
}
