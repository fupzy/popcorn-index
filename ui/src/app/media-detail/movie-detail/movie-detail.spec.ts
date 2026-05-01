import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { Observable, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { MediaDetailService, TmdbMovieDetails } from '../media-detail.service';

import { MovieDetail } from './movie-detail';

type GetMovieDetailsFn = (id: string) => Observable<TmdbMovieDetails>;

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

describe('MovieDetail', () => {
  let fixture: ComponentFixture<MovieDetail>;
  let loader: HarnessLoader;
  let getMovieDetailsSpy: Mock<GetMovieDetailsFn>;

  beforeEach(() => {
    getMovieDetailsSpy = vi.fn<GetMovieDetailsFn>();
    getMovieDetailsSpy.mockReturnValue(of(movieDetails));
  });

  const createComponent = (id: string) => {
    TestBed.configureTestingModule({
      imports: [MovieDetail],
      providers: [{ provide: MediaDetailService, useValue: { getMovieDetails: getMovieDetailsSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(MovieDetail);

    fixture.componentRef.setInput('id', id);

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  };

  it('should call getMovieDetails with the id input', () => {
    createComponent('603');

    expect(getMovieDetailsSpy).toHaveBeenCalledExactlyOnceWith('603');
  });

  it('should render the movie title, runtime, release date and genres on success', () => {
    createComponent('603');

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('The Matrix');
    expect(text).toContain('A hacker discovers reality.');
    expect(text).toContain('Free your mind.');
    expect(text).toContain('1999-03-31');
    expect(text).toContain('136 min');
    expect(text).toContain('Action');
    expect(text).toContain('Science Fiction');
  });

  it('should render the TMDB poster URL when poster_path is provided', () => {
    createComponent('603');

    const img = fixture.debugElement.query(By.css('article img'));

    expect(img).not.toBeNull();
    expect(img.nativeElement.getAttribute('src')).toEqual('https://image.tmdb.org/t/p/w500/matrix.jpg');
    expect(img.nativeElement.getAttribute('alt')).toEqual('The Matrix');
  });

  it('should render a fallback placeholder when poster_path is null', () => {
    getMovieDetailsSpy.mockReturnValue(of({ ...movieDetails, poster_path: null }));

    createComponent('603');

    expect(fixture.debugElement.query(By.css('article img'))).toBeNull();
    expect(fixture.debugElement.nativeElement.textContent).toContain('No poster');
  });

  it('should not render the runtime row when runtime is null', () => {
    getMovieDetailsSpy.mockReturnValue(of({ ...movieDetails, runtime: null }));

    createComponent('603');

    expect(fixture.debugElement.nativeElement.textContent).not.toContain('Runtime');
  });

  it('should display a spinner while the details request is pending', async () => {
    getMovieDetailsSpy.mockReturnValue(new Observable<TmdbMovieDetails>(() => undefined));

    createComponent('603');

    const spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

    expect(spinner).toBeTruthy();
    expect(fixture.debugElement.query(By.css('article'))).toBeNull();
  });

  it('should display an alert with an error message when the request fails', () => {
    getMovieDetailsSpy.mockReturnValue(throwError(() => new Error('boom')));

    createComponent('603');

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert).not.toBeNull();
    expect(alert.nativeElement.textContent).toContain('Unable to load details');
    expect(fixture.debugElement.query(By.css('article'))).toBeNull();
  });
});
