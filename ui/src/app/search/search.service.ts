import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TmdbMovie {
  readonly id: number;
  readonly title: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly release_date: string;
  readonly vote_average: number;
}

export interface TmdbSearchResponse {
  readonly page: number;
  readonly results: readonly TmdbMovie[];
  readonly total_pages: number;
  readonly total_results: number;
}

export interface TmdbLanguage {
  readonly iso_639_1: string;
  readonly english_name: string;
  readonly name: string;
}

/**
 * Searches TMDB through the backend proxy at `/api/v1/tmdb`.
 * The proxy injects the TMDB API key server-side, so the
 * frontend never sees nor handles credentials.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly baseUrl = '/popcorn-index/api/v1/tmdb';

  private readonly httpClient = inject(HttpClient);

  public searchMovies(query: string, language: string): Observable<TmdbSearchResponse> {
    const params = new HttpParams().append('query', query).append('language', language);
    return this.httpClient.get<TmdbSearchResponse>(`${this.baseUrl}/search/movie`, { params });
  }

  public getLanguages(): Observable<readonly TmdbLanguage[]> {
    return this.httpClient.get<readonly TmdbLanguage[]>(`${this.baseUrl}/configuration/languages`);
  }
}
