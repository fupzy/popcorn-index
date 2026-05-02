import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MediaDetailService, TmdbMovieDetails, TmdbSeriesDetails } from './media-detail.service';

const movieDetails: TmdbMovieDetails = {
  id: 603,
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  release_date: '1999-03-31',
  vote_average: 8.2,
  runtime: 136,
  tagline: 'Free your mind.',
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' }
  ]
};

const seriesDetails: TmdbSeriesDetails = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Seven noble families fight for the throne.',
  poster_path: '/got.jpg',
  first_air_date: '2011-04-17',
  vote_average: 8.4,
  number_of_seasons: 8,
  tagline: 'Winter is coming.',
  genres: [{ id: 18, name: 'Drama' }]
};

describe('MediaDetailService', () => {
  let service: MediaDetailService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true }
    });

    service = TestBed.inject(MediaDetailService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMovieDetails', () => {
    it('should GET /movie/:id', () => {
      service.getMovieDetails('603').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/movie/603');

      expect(request.request.method).toEqual('GET');
    });

    it('should emit the movie details payload as-is', () => {
      let received: TmdbMovieDetails | undefined;
      service.getMovieDetails('603').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/movie/603').flush(movieDetails);

      expect(received).toEqual(movieDetails);
    });
  });

  describe('getSeriesDetails', () => {
    it('should GET /tv/:id', () => {
      service.getSeriesDetails('1399').subscribe();

      const request = httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/tv/1399');

      expect(request.request.method).toEqual('GET');
    });

    it('should emit the series details payload as-is', () => {
      let received: TmdbSeriesDetails | undefined;
      service.getSeriesDetails('1399').subscribe((value) => {
        received = value;
      });

      httpTesting.expectOne((req) => req.url === '/popcorn-index/api/v1/tmdb/tv/1399').flush(seriesDetails);

      expect(received).toEqual(seriesDetails);
    });
  });
});
