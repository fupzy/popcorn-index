import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SearchService, TmdbSearchResponse } from './search.service';

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

  describe('searchMovies', () => {
    it('should GET the TMDB proxy with the query and language parameters', () => {
      service.searchMovies('matrix').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/movie');

      expect(request.request.method).toEqual('GET');
      expect(request.request.params.get('query')).toEqual('matrix');
      expect(request.request.params.get('language')).toEqual('fr-FR');
    });

    it('should emit the parsed response when the server returns a success', () => {
      const response: TmdbSearchResponse = {
        page: 1,
        results: [
          {
            id: 603,
            title: 'The Matrix',
            overview: 'A computer hacker learns about the true nature of reality.',
            poster_path: '/poster.jpg',
            release_date: '1999-03-31',
            vote_average: 8.2
          }
        ],
        total_pages: 1,
        total_results: 1
      };

      let received: TmdbSearchResponse | undefined;
      service.searchMovies('matrix').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/search/movie').flush(response);

      expect(received).toEqual(response);
    });
  });
});
