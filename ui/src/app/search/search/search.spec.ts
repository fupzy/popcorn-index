import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { SearchResult } from '../search-result/search-result';
import { SearchService, TmdbMovie, TmdbSearchResponse } from '../search.service';

import { Search } from './search';

type SearchMoviesFn = (query: string) => Observable<TmdbSearchResponse>;

const mockMovie: TmdbMovie = {
  id: 603,
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  release_date: '1999-03-31',
  vote_average: 8.2
};

const emptyResponse: TmdbSearchResponse = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0
};

const response: TmdbSearchResponse = {
  page: 1,
  results: [mockMovie],
  total_pages: 1,
  total_results: 1
};

describe('Search', () => {
  let fixture: ComponentFixture<Search>;
  let searchMoviesSpy: Mock<SearchMoviesFn>;

  const triggerSearch = (query: string): void => {
    fixture.debugElement.query(By.css('app-search-bar')).triggerEventHandler('searchRequested', query);
    fixture.detectChanges();
  };

  const getSearchResult = (): SearchResult => fixture.debugElement.query(By.directive(SearchResult)).componentInstance as SearchResult;

  beforeEach(() => {
    searchMoviesSpy = vi.fn<SearchMoviesFn>();
    searchMoviesSpy.mockReturnValue(of(emptyResponse));

    TestBed.configureTestingModule({
      imports: [Search],
      providers: [{ provide: SearchService, useValue: { searchMovies: searchMoviesSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Search);
    fixture.detectChanges();
  });

  it('should render the SearchBar and SearchResult subcomponents', () => {
    expect(fixture.debugElement.query(By.css('app-search-bar'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('app-search-result'))).not.toBeNull();
  });

  it('should call SearchService.searchMovies with the query emitted by the SearchBar', () => {
    triggerSearch('matrix');

    expect(searchMoviesSpy).toHaveBeenCalledExactlyOnceWith('matrix');
  });

  it('should pass the service results to the SearchResult on success', () => {
    searchMoviesSpy.mockReturnValue(of(response));

    triggerSearch('matrix');

    const searchResult = getSearchResult();
    expect(searchResult.movies()).toEqual(response.results);
    expect(searchResult.isLoading()).toEqual(false);
    expect(searchResult.errorMessage()).toBeNull();
  });

  it('should pass an empty list and an error message to the SearchResult on error', () => {
    searchMoviesSpy.mockReturnValue(throwError(() => new Error('boom')));

    triggerSearch('matrix');

    const searchResult = getSearchResult();
    expect(searchResult.movies()).toEqual([]);
    expect(searchResult.errorMessage()).toContain('Unable to search movies');
    expect(searchResult.isLoading()).toEqual(false);
  });

  it('should ignore further search requests while a search is already in flight', () => {
    const inFlight = new Subject<TmdbSearchResponse>();
    searchMoviesSpy.mockReturnValue(inFlight.asObservable());

    triggerSearch('matrix');
    triggerSearch('inception');

    expect(searchMoviesSpy).toHaveBeenCalledExactlyOnceWith('matrix');

    inFlight.complete();
  });
});
