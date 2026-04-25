import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTesting } from '@testing';

import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;
  let materialTesting: MaterialTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchBar],
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

  it('should not emit searchRequested when the submit button is clicked while the form is empty', async () => {
    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matIconButton.click('mat-icon');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit the trimmed query when the submit button is clicked', async () => {
    const emitSpy = vi.spyOn(component.searchRequested, 'emit');

    await materialTesting.matFormField.setMatInputValue('Search a movie', '  matrix  ');
    await materialTesting.matIconButton.click('mat-icon');

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith('matrix');
  });
});
