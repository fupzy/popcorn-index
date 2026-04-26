import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type MediaType = 'movie' | 'tv';
export type MediaTypeFilter = MediaType | 'all';

export interface TmdbMedia {
  readonly id: number;
  readonly mediaType: MediaType;
  readonly title: string;
  readonly overview: string;
  readonly poster_path: string | null;
  readonly date: string | null;
  readonly vote_average: number;
}

export interface TmdbSearchResponse {
  readonly page: number;
  readonly results: TmdbMedia[];
  readonly total_pages: number;
  readonly total_results: number;
}

export interface TmdbLanguage {
  readonly iso_639_1: string;
  readonly english_name: string;
  readonly name: string;
}

export interface RawMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface RawTvResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
}

export type RawMultiResult =
  | ({ media_type: 'movie' } & RawMovieResult)
  | ({ media_type: 'tv' } & RawTvResult)
  | { media_type: 'person'; id: number; name: string };

export interface RawTmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const nonEmptyOrNull = (value: string | undefined): string | null => (value !== undefined && value.length > 0 ? value : null);

const movieToMedia = (raw: RawMovieResult): TmdbMedia => ({
  id: raw.id,
  mediaType: 'movie',
  title: raw.title,
  overview: raw.overview,
  poster_path: raw.poster_path,
  date: nonEmptyOrNull(raw.release_date),
  vote_average: raw.vote_average
});

const tvToMedia = (raw: RawTvResult): TmdbMedia => ({
  id: raw.id,
  mediaType: 'tv',
  title: raw.name,
  overview: raw.overview,
  poster_path: raw.poster_path,
  date: nonEmptyOrNull(raw.first_air_date),
  vote_average: raw.vote_average
});

const multiToMedia = (raw: RawMultiResult): TmdbMedia | null => {
  if (raw.media_type === 'movie') {
    return movieToMedia(raw);
  }

  if (raw.media_type === 'tv') {
    return tvToMedia(raw);
  }

  return null;
};

const toTmdbSearchResponse = <T>(response: RawTmdbResponse<T>, toMedia: (raw: T) => TmdbMedia | null): TmdbSearchResponse => {
  const results = response.results.map(toMedia).filter((media): media is TmdbMedia => media !== null);

  return {
    page: response.page,
    total_pages: response.total_pages,
    total_results: response.total_results,
    results
  };
};

/**
 * Searches TMDB through the backend proxy at `/api/v1/tmdb`.
 * The proxy injects the TMDB API key server-side, so the
 * frontend never sees nor handles credentials.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly baseUrl = '/popcorn-index/api/v1/tmdb';

  private readonly httpClient = inject(HttpClient);

  public search(query: string, language: string, mediaType: MediaTypeFilter): Observable<TmdbSearchResponse> {
    const params = new HttpParams().append('query', query).append('language', language);

    if (mediaType === 'movie') {
      return this.fetchSearch<RawMovieResult>('search/movie', params, movieToMedia);
    }

    if (mediaType === 'tv') {
      return this.fetchSearch<RawTvResult>('search/tv', params, tvToMedia);
    }

    return this.fetchSearch<RawMultiResult>('search/multi', params, multiToMedia);
  }

  public getLanguages(): Observable<TmdbLanguage[]> {
    return this.httpClient.get<TmdbLanguage[]>(`${this.baseUrl}/configuration/languages`);
  }

  private fetchSearch<T>(path: string, params: HttpParams, toMedia: (raw: T) => TmdbMedia | null): Observable<TmdbSearchResponse> {
    return this.httpClient
      .get<RawTmdbResponse<T>>(`${this.baseUrl}/${path}`, { params })
      .pipe(map((response) => toTmdbSearchResponse(response, toMedia)));
  }
}
