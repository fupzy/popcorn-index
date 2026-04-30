import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  RawMovieResult,
  RawMultiResult,
  RawTmdbResponse,
  RawTvResult,
  SearchService,
  TmdbLanguage,
  TmdbMedia,
  TmdbSearchResponse
} from './search.service';

const movieRaw: RawMovieResult = {
  id: 603,
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  release_date: '1999-03-31',
  vote_average: 8.2
};

const tvRaw: RawTvResult = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Seven noble families fight for the throne.',
  poster_path: '/got.jpg',
  first_air_date: '2011-04-17',
  vote_average: 8.4
};

describe('SearchService', () => {
  let service: SearchService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true }
    });

    service = TestBed.inject(SearchService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should GET /search/movie when mediaType is "movie" and forward query and language as params', () => {
      service.search('matrix', 'fr', 'movie').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/movie');

      expect(request.request.method).toEqual('GET');
      expect(request.request.params.get('query')).toEqual('matrix');
      expect(request.request.params.get('language')).toEqual('fr');
    });

    it('should GET /search/tv when mediaType is "tv"', () => {
      service.search('matrix', 'fr', 'tv').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/tv');

      expect(request.request.method).toEqual('GET');
    });

    it('should GET /search/multi when mediaType is "all"', () => {
      service.search('matrix', 'fr', 'all').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/multi');

      expect(request.request.method).toEqual('GET');
    });

    it('should normalize movie results into the unified TmdbMedia shape', () => {
      const raw: RawTmdbResponse<RawMovieResult> = {
        page: 1,
        results: [movieRaw],
        total_pages: 1,
        total_results: 1
      };

      let received: TmdbSearchResponse | undefined;
      service.search('matrix', 'fr', 'movie').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/movie').flush(raw);

      const expected: TmdbMedia = {
        id: 603,
        mediaType: 'movie',
        title: 'The Matrix',
        overview: 'A hacker discovers reality.',
        poster_path: '/matrix.jpg',
        date: '1999-03-31',
        vote_average: 8.2
      };
      expect(received?.results).toEqual([expected]);
    });

    it('should normalize tv results, mapping name and first_air_date into title and date', () => {
      const raw: RawTmdbResponse<RawTvResult> = {
        page: 1,
        results: [tvRaw],
        total_pages: 1,
        total_results: 1
      };

      let received: TmdbSearchResponse | undefined;
      service.search('thrones', 'fr', 'tv').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/tv').flush(raw);

      const expected: TmdbMedia = {
        id: 1399,
        mediaType: 'tv',
        title: 'Game of Thrones',
        overview: 'Seven noble families fight for the throne.',
        poster_path: '/got.jpg',
        date: '2011-04-17',
        vote_average: 8.4
      };
      expect(received?.results).toEqual([expected]);
    });

    it('should map empty release_date to null', () => {
      const raw: RawTmdbResponse<RawMovieResult> = {
        page: 1,
        results: [{ ...movieRaw, release_date: '' }],
        total_pages: 1,
        total_results: 1
      };

      let received: TmdbSearchResponse | undefined;
      service.search('matrix', 'fr', 'movie').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/movie').flush(raw);

      expect(received?.results[0]?.date).toBeNull();
    });

    it('should normalize multi results and filter out persons', () => {
      const raw: RawTmdbResponse<RawMultiResult> = {
        page: 1,
        results: [
          { ...movieRaw, media_type: 'movie' },
          { ...tvRaw, media_type: 'tv' },
          { id: 42, media_type: 'person', name: 'Keanu Reeves' }
        ],
        total_pages: 1,
        total_results: 3
      };

      let received: TmdbSearchResponse | undefined;
      service.search('matrix', 'fr', 'all').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/multi').flush(raw);

      expect(received?.results).toHaveLength(2);
      expect(received?.results[0]?.mediaType).toEqual('movie');
      expect(received?.results[0]?.title).toEqual('The Matrix');
      expect(received?.results[1]?.mediaType).toEqual('tv');
      expect(received?.results[1]?.title).toEqual('Game of Thrones');
    });
  });

  describe('getLanguages', () => {
    it('should GET the TMDB proxy /configuration/languages endpoint', () => {
      service.getLanguages().subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/configuration/languages');

      expect(request.request.method).toEqual('GET');
    });

    it('should emit the parsed list of languages when the server returns a success', () => {
      const languages: TmdbLanguage[] = [
        { iso_639_1: 'fr', english_name: 'French', name: 'Français' },
        { iso_639_1: 'en', english_name: 'English', name: 'English' }
      ];

      let received: TmdbLanguage[] | undefined;
      service.getLanguages().subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/configuration/languages').flush(languages);

      expect(received).toEqual(languages);
    });
  });
});
