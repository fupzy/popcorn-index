import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Mock } from 'vitest';

import { MaterialTesting } from '@testing';

import { SearchService, TmdbLanguage } from '../search.service';

import { SearchBar, SearchRequest } from './search-bar';

type GetLanguagesFn = () => Observable<TmdbLanguage[]>;

const french: TmdbLanguage = { iso_639_1: 'fr', english_name: 'French', name: 'Français' };
const english: TmdbLanguage = { iso_639_1: 'en', english_name: 'English', name: 'English' };
const noEnglishName: TmdbLanguage = { iso_639_1: 'xx', english_name: '', name: '' };

const mockLanguages: TmdbLanguage[] = [english, french, noEnglishName];

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;
  let materialTesting: MaterialTesting;
  let getLanguagesSpy: Mock<GetLanguagesFn>;

  beforeEach(() => {
    getLanguagesSpy = vi.fn<GetLanguagesFn>();
    getLanguagesSpy.mockReturnValue(of(mockLanguages));

    TestBed.configureTestingModule({
      imports: [SearchBar],
      providers: [{ provide: SearchService, useValue: { getLanguages: getLanguagesSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    materialTesting = new MaterialTesting(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a labeled search input and a submit icon button', async () => {
    const inputExists = await materialTesting.matFormField.exists('Search a movie');
    const buttonExists = await materialTesting.matIconButton.exists('mat-icon');

    expect(inputExists).toEqual(true);
    expect(buttonExists).toEqual(true);
  });

  it('should render a language selector defaulting to French', async () => {
    const exists = await materialTesting.matFormField.exists('Language');
    const value = await materialTesting.matFormField.getMatSelectValue('Language');

    expect(exists).toEqual(true);
    expect(value).toEqual('French');
  });

  it('should populate the language selector with options from SearchService.getLanguages, sorted alphabetically and excluding entries without an English name', async () => {
    const options = await materialTesting.matFormField.getMatSelectOptions('Language');

    expect(getLanguagesSpy).toHaveBeenCalledOnce();
    expect(options).toEqual(['English', 'French']);
  });

  it('should not emit searchRequested when the submit button is clicked while the form is empty', async () => {
    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matIconButton.click('mat-icon');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit the trimmed query and the default French language when the submit button is clicked', async () => {
    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search a movie', '  matrix  ');
    await materialTesting.matIconButton.click('mat-icon');

    const expected: SearchRequest = { query: 'matrix', language: 'fr' };
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('should emit the language selected by the user', async () => {
    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search a movie', 'matrix');
    await materialTesting.matFormField.setMatSelectValue('Language', 'English');
    await materialTesting.matIconButton.click('mat-icon');

    const expected: SearchRequest = { query: 'matrix', language: 'en' };
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(expected);
  });
});
