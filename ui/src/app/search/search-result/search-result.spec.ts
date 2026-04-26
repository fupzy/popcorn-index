import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';

import { TmdbMedia } from '../search.service';

import { SearchResult } from './search-result';

@Component({
  imports: [SearchResult],
  template: ` <app-search-result [results]="results()" [isLoading]="isLoading()" [errorMessage]="errorMessage()"></app-search-result> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  public readonly results = signal<TmdbMedia[]>([]);
  public readonly isLoading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
}

const mockMovie: TmdbMedia = {
  id: 603,
  mediaType: 'movie',
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  date: '1999-03-31',
  vote_average: 8.2
};

const mockTv: TmdbMedia = {
  id: 1399,
  mediaType: 'tv',
  title: 'Game of Thrones',
  overview: 'Seven noble families fight for the throne.',
  poster_path: '/got.jpg',
  date: '2011-04-17',
  vote_average: 8.4
};

describe('SearchResult', () => {
  let fixture: ComponentFixture<TestComponent>;
  let host: TestComponent;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(TestComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    const element = fixture.debugElement.query(By.css('app-search-result'));
    expect(element).not.toBeNull();
  });

  it('should display the empty-state message when not loading and no results are provided', () => {
    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('No results yet');
  });

  it('should display a spinner when isLoading is true', async () => {
    host.isLoading.set(true);
    fixture.detectChanges();

    const spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

    expect(spinner).toBeTruthy();
  });

  it('should display an alert with the error message when one is provided', () => {
    host.errorMessage.set('Something went wrong');
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert).not.toBeNull();
    expect(alert.nativeElement.textContent).toContain('Something went wrong');
  });

  it('should render one list item per result with title, type label and date', () => {
    host.results.set([mockMovie, mockTv]);
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('li'));

    expect(items).toHaveLength(2);
    expect(items[0].nativeElement.textContent).toContain('The Matrix');
    expect(items[0].nativeElement.textContent).toContain('Movie');
    expect(items[0].nativeElement.textContent).toContain('1999-03-31');
    expect(items[1].nativeElement.textContent).toContain('Game of Thrones');
    expect(items[1].nativeElement.textContent).toContain('TV');
    expect(items[1].nativeElement.textContent).toContain('2011-04-17');
  });

  it('should render the TMDB poster URL when poster_path is provided', () => {
    host.results.set([mockMovie]);
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('li img'));

    expect(img).not.toBeNull();
    expect(img.nativeElement.getAttribute('src')).toEqual('https://image.tmdb.org/t/p/w342/matrix.jpg');
    expect(img.nativeElement.getAttribute('alt')).toEqual('The Matrix');
  });

  it('should render a fallback placeholder when the result has no poster_path', () => {
    host.results.set([{ ...mockMovie, poster_path: null }]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('li img'))).toBeNull();
    expect(fixture.debugElement.nativeElement.textContent).toContain('No poster');
  });

  it('should not render the date span when date is null', () => {
    host.results.set([{ ...mockMovie, date: null }]);
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.css('li'));
    const text = item.nativeElement.textContent;

    expect(text).not.toContain('1999-03-31');
    expect(text).toContain('Movie');
  });
});
