import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { LoadingShell } from '@shared';

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

  [
    { description: 'tagline paragraph when tagline is empty', overrides: { tagline: '' }, missing: 'Free your mind.' },
    { description: 'overview paragraph when overview is empty', overrides: { overview: '' }, missing: 'A hacker discovers reality.' },
    { description: 'release row when release_date is empty', overrides: { release_date: '' }, missing: 'Release' },
    { description: 'runtime row when runtime is null', overrides: { runtime: null }, missing: 'Runtime' },
    { description: 'genres row when genres is empty', overrides: { genres: [] }, missing: 'Genres' }
  ].forEach(({ description, overrides, missing }) => {
    it(`should not render the ${description}`, () => {
      getMovieDetailsSpy.mockReturnValue(of({ ...movieDetails, ...overrides }));

      createComponent('603');

      expect(fixture.debugElement.nativeElement.textContent).not.toContain(missing);
    });
  });

  it('should forward an error message to LoadingShell when the request fails', () => {
    getMovieDetailsSpy.mockReturnValue(throwError(() => new Error('boom')));

    createComponent('603');

    const loadingShell = fixture.debugElement.query(By.directive(LoadingShell)).componentInstance as LoadingShell;
    expect(loadingShell.errorMessage()).toContain('Unable to load details');
  });
});
