import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { provideRoutingTesting } from '@testing';

import { SearchBar, SearchRequest } from '../search-bar/search-bar';
import { SearchResult } from '../search-result/search-result';
import { SearchStateService } from '../search-state.service';
import { MediaTypeFilter, SearchService, TmdbMedia, TmdbSearchResponse } from '../search.service';

import { Search } from './search';

type SearchFn = (query: string, language: string, mediaType: MediaTypeFilter) => Observable<TmdbSearchResponse>;

const mockMedia: TmdbMedia = {
  id: 603,
  mediaType: 'movie',
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  date: '1999-03-31',
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
  results: [mockMedia],
  total_pages: 1,
  total_results: 1
};

const matrixSearch: SearchRequest = { query: 'matrix', language: 'fr', mediaType: 'all' };
const inceptionSearch: SearchRequest = { query: 'inception', language: 'fr', mediaType: 'all' };

describe('Search', () => {
  let fixture: ComponentFixture<Search>;
  let searchSpy: Mock<SearchFn>;

  const triggerSearch = (request: SearchRequest): void => {
    fixture.debugElement.query(By.css('app-search-bar')).triggerEventHandler('searchRequested', request);
    fixture.detectChanges();
  };

  const getSearchResult = (): SearchResult => fixture.debugElement.query(By.directive(SearchResult)).componentInstance as SearchResult;

  beforeEach(() => {
    searchSpy = vi.fn<SearchFn>();
    searchSpy.mockReturnValue(of(emptyResponse));

    TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRoutingTesting(), { provide: SearchService, useValue: { search: searchSpy, getLanguages: () => of([]) } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Search);
    fixture.detectChanges();
  });

  it('should render the SearchBar and SearchResult subcomponents', () => {
    expect(fixture.debugElement.query(By.css('app-search-bar'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('app-search-result'))).not.toBeNull();
  });

  it('should call SearchService.search with the query, language and mediaType emitted by the SearchBar', () => {
    triggerSearch(matrixSearch);

    expect(searchSpy).toHaveBeenCalledExactlyOnceWith('matrix', 'fr', 'all');
  });

  it('should pass the service results to the SearchResult on success', () => {
    searchSpy.mockReturnValue(of(response));

    triggerSearch(matrixSearch);

    const searchResult = getSearchResult();
    expect(searchResult.results()).toEqual(response.results);
    expect(searchResult.isLoading()).toEqual(false);
    expect(searchResult.errorMessage()).toBeNull();
  });

  it('should pass an empty list and an error message to the SearchResult on error', () => {
    searchSpy.mockReturnValue(throwError(() => new Error('boom')));

    triggerSearch(matrixSearch);

    const searchResult = getSearchResult();
    expect(searchResult.results()).toEqual([]);
    expect(searchResult.errorMessage()).toContain('Unable to search movies');
    expect(searchResult.isLoading()).toEqual(false);
  });

  it('should ignore further search requests while a search is already in flight', () => {
    const inFlight = new Subject<TmdbSearchResponse>();
    searchSpy.mockReturnValue(inFlight.asObservable());

    triggerSearch(matrixSearch);
    triggerSearch(inceptionSearch);

    expect(searchSpy).toHaveBeenCalledExactlyOnceWith('matrix', 'fr', 'all');

    inFlight.complete();
  });

  it('should restore the previous search request as initial values on the SearchBar after re-mount', () => {
    searchSpy.mockReturnValue(of(response));

    triggerSearch(matrixSearch);

    fixture.destroy();

    const remountedFixture = TestBed.createComponent(Search);
    remountedFixture.detectChanges();

    const searchBar = remountedFixture.debugElement.query(By.directive(SearchBar)).componentInstance as SearchBar;
    expect(searchBar.initialQuery()).toEqual('matrix');
    expect(searchBar.initialLanguage()).toEqual('fr');
    expect(searchBar.initialMediaType()).toEqual('all');
  });

  it('should retain the previous results in the SearchStateService after the component is destroyed', () => {
    searchSpy.mockReturnValue(of(response));

    triggerSearch(matrixSearch);

    fixture.destroy();

    const state = TestBed.inject(SearchStateService);
    expect(state.results()).toEqual(response.results);
  });
});
