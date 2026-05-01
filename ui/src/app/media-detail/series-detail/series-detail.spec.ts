import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { Observable, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { MediaDetailService, TmdbSeriesDetails } from '../media-detail.service';

import { SeriesDetail } from './series-detail';

type GetSeriesDetailsFn = (id: string) => Observable<TmdbSeriesDetails>;

const seriesDetails: TmdbSeriesDetails = {
  id: 1399,
  name: 'Game of Thrones',
  overview: 'Seven noble families fight for the throne.',
  poster_path: '/got.jpg',
  first_air_date: '2011-04-17',
  vote_average: 8.4,
  number_of_seasons: 8,
  tagline: 'Winter is coming.',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' }
  ]
};

describe('SeriesDetail', () => {
  let fixture: ComponentFixture<SeriesDetail>;
  let loader: HarnessLoader;
  let getSeriesDetailsSpy: Mock<GetSeriesDetailsFn>;

  beforeEach(() => {
    getSeriesDetailsSpy = vi.fn<GetSeriesDetailsFn>();
    getSeriesDetailsSpy.mockReturnValue(of(seriesDetails));
  });

  const createComponent = (id: string) => {
    TestBed.configureTestingModule({
      imports: [SeriesDetail],
      providers: [{ provide: MediaDetailService, useValue: { getSeriesDetails: getSeriesDetailsSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(SeriesDetail);

    fixture.componentRef.setInput('id', id);

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  };

  it('should call getSeriesDetails with the id input', () => {
    createComponent('1399');

    expect(getSeriesDetailsSpy).toHaveBeenCalledExactlyOnceWith('1399');
  });

  it('should render the series name, seasons, first air date and genres on success', () => {
    createComponent('1399');

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('Game of Thrones');
    expect(text).toContain('Seven noble families fight for the throne.');
    expect(text).toContain('Winter is coming.');
    expect(text).toContain('2011-04-17');
    expect(text).toContain('Seasons');
    expect(text).toContain('8');
    expect(text).toContain('Drama');
    expect(text).toContain('Sci-Fi & Fantasy');
  });

  it('should render the TMDB poster URL when poster_path is provided', () => {
    createComponent('1399');

    const img = fixture.debugElement.query(By.css('article img'));

    expect(img).not.toBeNull();
    expect(img.nativeElement.getAttribute('src')).toEqual('https://image.tmdb.org/t/p/w500/got.jpg');
    expect(img.nativeElement.getAttribute('alt')).toEqual('Game of Thrones');
  });

  it('should render a fallback placeholder when poster_path is null', () => {
    getSeriesDetailsSpy.mockReturnValue(of({ ...seriesDetails, poster_path: null }));

    createComponent('1399');

    expect(fixture.debugElement.query(By.css('article img'))).toBeNull();
    expect(fixture.debugElement.nativeElement.textContent).toContain('No poster');
  });

  [
    { description: 'tagline paragraph when tagline is empty', overrides: { tagline: '' }, missing: 'Winter is coming.' },
    { description: 'overview paragraph when overview is empty', overrides: { overview: '' }, missing: 'Seven noble families fight for the throne.' },
    { description: 'first aired row when first_air_date is empty', overrides: { first_air_date: '' }, missing: 'First aired' },
    { description: 'genres row when genres is empty', overrides: { genres: [] }, missing: 'Genres' }
  ].forEach(({ description, overrides, missing }) => {
    it(`should not render the ${description}`, () => {
      getSeriesDetailsSpy.mockReturnValue(of({ ...seriesDetails, ...overrides }));

      createComponent('1399');

      expect(fixture.debugElement.nativeElement.textContent).not.toContain(missing);
    });
  });

  it('should display a spinner while the details request is pending', async () => {
    getSeriesDetailsSpy.mockReturnValue(new Observable<TmdbSeriesDetails>(() => undefined));

    createComponent('1399');

    const spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

    expect(spinner).toBeTruthy();
    expect(fixture.debugElement.query(By.css('article'))).toBeNull();
  });

  it('should display an alert with an error message when the request fails', () => {
    getSeriesDetailsSpy.mockReturnValue(throwError(() => new Error('boom')));

    createComponent('1399');

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));

    expect(alert).not.toBeNull();
    expect(alert.nativeElement.textContent).toContain('Unable to load details');
    expect(fixture.debugElement.query(By.css('article'))).toBeNull();
  });
});
