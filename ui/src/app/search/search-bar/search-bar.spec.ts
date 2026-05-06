import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Mock } from 'vitest';

import { MaterialTesting } from '@testing';

import { MediaTypeFilter, SearchService, TmdbLanguage } from '../search.service';

import { SearchBar, SearchRequest } from './search-bar';

type GetLanguagesFn = () => Observable<TmdbLanguage[]>;

const french: TmdbLanguage = { iso_639_1: 'fr', english_name: 'French', name: 'Français' };
const english: TmdbLanguage = { iso_639_1: 'en', english_name: 'English', name: 'English' };
const noEnglishName: TmdbLanguage = { iso_639_1: 'xx', english_name: '', name: '' };

const mockLanguages: TmdbLanguage[] = [english, french, noEnglishName];

interface InitialSearchValues {
  query?: string;
  language?: string;
  mediaType?: MediaTypeFilter;
}

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;
  let materialTesting: MaterialTesting;
  let getLanguagesSpy: Mock<GetLanguagesFn>;

  beforeEach(() => {
    getLanguagesSpy = vi.fn<GetLanguagesFn>();
    getLanguagesSpy.mockReturnValue(of(mockLanguages));
  });

  const createComponent = (initial: InitialSearchValues = {}) => {
    TestBed.configureTestingModule({
      imports: [SearchBar],
      providers: [{ provide: SearchService, useValue: { getLanguages: getLanguagesSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;

    if (initial.query !== undefined) {
      fixture.componentRef.setInput('initialQuery', initial.query);
    }
    if (initial.language !== undefined) {
      fixture.componentRef.setInput('initialLanguage', initial.language);
    }
    if (initial.mediaType !== undefined) {
      fixture.componentRef.setInput('initialMediaType', initial.mediaType);
    }

    materialTesting = new MaterialTesting(fixture);
    fixture.detectChanges();
  };

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  it('should render a labeled search input and a submit icon button', async () => {
    createComponent();

    const inputExists = await materialTesting.matFormField.exists('Search movies & series');
    const buttonExists = await materialTesting.matIconButton.exists('mat-icon');

    expect(inputExists).toEqual(true);
    expect(buttonExists).toEqual(true);
  });

  it('should render a language selector defaulting to French', async () => {
    createComponent();

    const exists = await materialTesting.matFormField.exists('Language');
    const value = await materialTesting.matFormField.getMatSelectValue('Language');

    expect(exists).toEqual(true);
    expect(value).toEqual('French');
  });

  it('should populate the language selector with options from SearchService.getLanguages, sorted alphabetically and excluding entries without an English name', async () => {
    createComponent();

    const options = await materialTesting.matFormField.getMatSelectOptions('Language');

    expect(getLanguagesSpy).toHaveBeenCalledOnce();
    expect(options).toEqual(['English', 'French']);
  });

  it('should render a media-type selector defaulting to All with options All, Movies, Series', async () => {
    createComponent();

    const exists = await materialTesting.matFormField.exists('Type');
    const value = await materialTesting.matFormField.getMatSelectValue('Type');
    const options = await materialTesting.matFormField.getMatSelectOptions('Type');

    expect(exists).toEqual(true);
    expect(value).toEqual('All');
    expect(options).toEqual(['All', 'Movies', 'Series']);
  });

  it('should update the search input label according to the selected media type', async () => {
    createComponent();

    expect(await materialTesting.matFormField.exists('Search movies & series')).toEqual(true);

    await materialTesting.matFormField.setMatSelectValue('Type', 'Movies');
    expect(await materialTesting.matFormField.exists('Search a movie')).toEqual(true);

    await materialTesting.matFormField.setMatSelectValue('Type', 'Series');
    expect(await materialTesting.matFormField.exists('Search a series')).toEqual(true);

    await materialTesting.matFormField.setMatSelectValue('Type', 'All');
    expect(await materialTesting.matFormField.exists('Search movies & series')).toEqual(true);
  });

  it('should not emit searchRequested when the submit button is clicked while the form is empty', async () => {
    createComponent();

    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matIconButton.click('mat-icon');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit the trimmed query, default French language, and default All media type when the submit button is clicked', async () => {
    createComponent();

    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search movies & series', '  matrix  ');
    await materialTesting.matIconButton.click('mat-icon');

    const expected: SearchRequest = { query: 'matrix', language: 'fr', mediaType: 'all' };
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('should emit the language selected by the user', async () => {
    createComponent();

    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search movies & series', 'matrix');
    await materialTesting.matFormField.setMatSelectValue('Language', 'English');
    await materialTesting.matIconButton.click('mat-icon');

    const expected: SearchRequest = { query: 'matrix', language: 'en', mediaType: 'all' };
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('should emit the media type selected by the user', async () => {
    createComponent();

    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search movies & series', 'thrones');
    await materialTesting.matFormField.setMatSelectValue('Type', 'Series');
    await materialTesting.matIconButton.click('mat-icon');

    const expected: SearchRequest = { query: 'thrones', language: 'fr', mediaType: 'tv' };
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('should pre-fill the form with the initialQuery, initialLanguage and initialMediaType inputs', async () => {
    createComponent({ query: 'matrix', language: 'en', mediaType: 'movie' });

    const queryValue = await materialTesting.matFormField.getMatInputValue('Search a movie');
    const languageValue = await materialTesting.matFormField.getMatSelectValue('Language');
    const typeValue = await materialTesting.matFormField.getMatSelectValue('Type');

    expect(queryValue).toEqual('matrix');
    expect(languageValue).toEqual('English');
    expect(typeValue).toEqual('Movies');
  });
});
