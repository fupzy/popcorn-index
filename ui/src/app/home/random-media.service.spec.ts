import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RawMovieResult, RawTmdbResponse, RawTvResult, TmdbMedia } from '../search/search.service';

import { RandomMediaService } from './random-media.service';

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
  overview: 'Seven noble families fight.',
  poster_path: '/got.jpg',
  first_air_date: '2011-04-17',
  vote_average: 8.4
};

const movieResponse: RawTmdbResponse<RawMovieResult> = {
  page: 1,
  total_pages: 1,
  total_results: 1,
  results: [movieRaw]
};

const tvResponse: RawTmdbResponse<RawTvResult> = {
  page: 1,
  total_pages: 1,
  total_results: 1,
  results: [tvRaw]
};

describe('RandomMediaService', () => {
  let service: RandomMediaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true }
    });

    service = TestBed.inject(RandomMediaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should GET /trending/movie/week and map the result to a movie TmdbMedia when random picks a movie', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const received: { value: TmdbMedia | null } = { value: null };
    service.getRandomMedia().subscribe((media) => {
      received.value = media;
    });

    const request = httpTesting.expectOne('/popcorn-index/api/v1/tmdb/trending/movie/week');
    expect(request.request.method).toEqual('GET');
    request.flush(movieResponse);

    expect(received.value).toEqual<TmdbMedia>({
      id: 603,
      mediaType: 'movie',
      title: 'The Matrix',
      overview: 'A hacker discovers reality.',
      poster_path: '/matrix.jpg',
      date: '1999-03-31',
      vote_average: 8.2
    });
  });

  it('should GET /trending/tv/week and map the result to a tv TmdbMedia when random picks a series', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const received: { value: TmdbMedia | null } = { value: null };
    service.getRandomMedia().subscribe((media) => {
      received.value = media;
    });

    const request = httpTesting.expectOne('/popcorn-index/api/v1/tmdb/trending/tv/week');
    expect(request.request.method).toEqual('GET');
    request.flush(tvResponse);

    expect(received.value).toEqual<TmdbMedia>({
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      overview: 'Seven noble families fight.',
      poster_path: '/got.jpg',
      date: '2011-04-17',
      vote_average: 8.4
    });
  });

  it('should resolve to null when the trending endpoint returns no results', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const received: { emitted: boolean; value: TmdbMedia | null } = { emitted: false, value: null };
    service.getRandomMedia().subscribe((media) => {
      received.value = media;
      received.emitted = true;
    });

    const emptyResponse: RawTmdbResponse<RawMovieResult> = { page: 1, total_pages: 0, total_results: 0, results: [] };
    const request = httpTesting.expectOne('/popcorn-index/api/v1/tmdb/trending/movie/week');
    request.flush(emptyResponse);

    expect(received.emitted).toBe(true);
    expect(received.value).toBeNull();
  });

  it('should map an empty release_date to date null', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const received: { value: TmdbMedia | null } = { value: null };
    service.getRandomMedia().subscribe((media) => {
      received.value = media;
    });

    const responseWithEmptyDate: RawTmdbResponse<RawMovieResult> = {
      ...movieResponse,
      results: [{ ...movieRaw, release_date: '' }]
    };
    const request = httpTesting.expectOne('/popcorn-index/api/v1/tmdb/trending/movie/week');
    request.flush(responseWithEmptyDate);

    expect(received.value?.date).toBeNull();
  });
});
