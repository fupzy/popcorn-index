import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { LoadingShell } from '@shared';
import { provideRoutingTesting } from '@testing';

import { TmdbMedia } from '../search/search.service';

import { Home } from './home';
import { RandomMediaService } from './random-media.service';

type GetRandomMediaFn = () => Observable<TmdbMedia | null>;

const movieMedia: TmdbMedia = {
  id: 603,
  mediaType: 'movie',
  title: 'The Matrix',
  overview: 'A hacker discovers reality.',
  poster_path: '/matrix.jpg',
  date: '1999-03-31',
  vote_average: 8.2
};

const tvMedia: TmdbMedia = {
  id: 1399,
  mediaType: 'tv',
  title: 'Game of Thrones',
  overview: 'Seven noble families fight.',
  poster_path: '/got.jpg',
  date: '2011-04-17',
  vote_average: 8.4
};

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let getRandomMediaSpy: Mock<GetRandomMediaFn>;

  beforeEach(() => {
    getRandomMediaSpy = vi.fn<GetRandomMediaFn>();
    getRandomMediaSpy.mockReturnValue(of(movieMedia));

    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRoutingTesting(), { provide: RandomMediaService, useValue: { getRandomMedia: getRandomMediaSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  it('should call getRandomMedia on init', () => {
    expect(getRandomMediaSpy).toHaveBeenCalledOnce();
  });

  it('should render the random media title, overview and date when a movie is loaded', () => {
    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('The Matrix');
    expect(text).toContain('A hacker discovers reality.');
    expect(text).toContain('1999-03-31');
    expect(text).toContain('Movie');
  });

  it('should render the TMDB poster URL for the suggested media', () => {
    const img = fixture.debugElement.query(By.css('article img'));

    expect(img.nativeElement.getAttribute('src')).toEqual('https://image.tmdb.org/t/p/w342/matrix.jpg');
    expect(img.nativeElement.getAttribute('alt')).toEqual('The Matrix');
  });

  it('should render a "Series" label and the series detail link when a tv media is loaded', () => {
    getRandomMediaSpy.mockReturnValue(of(tvMedia));

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;
    expect(text).toContain('Series');
    expect(text).toContain('Game of Thrones');

    const link = fixture.debugElement.query(By.css('a[href]'));
    expect(link.nativeElement.getAttribute('href')).toEqual('/series-detail/1399');
  });

  it('should link to the movie detail page when a movie is loaded', () => {
    const link = fixture.debugElement.query(By.css('a[href]'));

    expect(link.nativeElement.getAttribute('href')).toEqual('/movie-detail/603');
  });

  it('should regenerate the suggested media when the logo button is clicked', () => {
    getRandomMediaSpy.mockClear();
    getRandomMediaSpy.mockReturnValue(of(tvMedia));

    const logoButton = fixture.debugElement.query(By.css('button[aria-label="Discover another title"]'));
    logoButton.nativeElement.click();
    fixture.detectChanges();

    expect(getRandomMediaSpy).toHaveBeenCalledOnce();
    expect(fixture.debugElement.nativeElement.textContent).toContain('Game of Thrones');
  });

  it('should forward an error message to LoadingShell when the request fails', () => {
    getRandomMediaSpy.mockReturnValue(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    const loadingShell = fixture.debugElement.query(By.directive(LoadingShell)).componentInstance as LoadingShell;
    expect(loadingShell.errorMessage()).toContain('Unable to load a discovery suggestion');
  });
});
