import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { LoadingShell } from '@shared';

import { MediaDetailService, TmdbSeasonDetails } from '../../media-detail.service';

import { SeasonDetail } from './season-detail';

type GetSeasonDetailsFn = (seriesId: number, seasonNumber: number) => Observable<TmdbSeasonDetails>;

const seasonDetails: TmdbSeasonDetails = {
  id: 3624,
  season_number: 1,
  name: 'Season 1',
  overview: 'The Stark family heads to Kings Landing.',
  poster_path: '/got-s1.jpg',
  air_date: '2011-04-17',
  episodes: [
    {
      id: 63056,
      episode_number: 1,
      name: 'Winter Is Coming',
      overview: 'Lord Eddard Stark is troubled by reports.',
      still_path: '/got-s1e1.jpg',
      air_date: '2011-04-17',
      runtime: 62,
      vote_average: 8.1
    },
    {
      id: 63057,
      episode_number: 2,
      name: 'The Kingsroad',
      overview: 'While Bran fights for his life.',
      still_path: '/got-s1e2.jpg',
      air_date: '2011-04-24',
      runtime: 56,
      vote_average: 8.0
    }
  ]
};

describe('SeasonDetail', () => {
  let fixture: ComponentFixture<SeasonDetail>;
  let getSeasonDetailsSpy: Mock<GetSeasonDetailsFn>;

  beforeEach(() => {
    getSeasonDetailsSpy = vi.fn<GetSeasonDetailsFn>();
    getSeasonDetailsSpy.mockReturnValue(of(seasonDetails));
  });

  const createComponent = (seriesId: number, seasonNumber: number) => {
    TestBed.configureTestingModule({
      imports: [SeasonDetail],
      providers: [{ provide: MediaDetailService, useValue: { getSeasonDetails: getSeasonDetailsSpy } }],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(SeasonDetail);

    fixture.componentRef.setInput('seriesId', seriesId);
    fixture.componentRef.setInput('seasonNumber', seasonNumber);

    fixture.detectChanges();
  };

  it('should call getSeasonDetails with the seriesId and seasonNumber inputs', () => {
    createComponent(1399, 1);

    expect(getSeasonDetailsSpy).toHaveBeenCalledExactlyOnceWith(1399, 1);
  });

  it('should render each episode with number, name, air date and runtime', () => {
    createComponent(1399, 1);

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('1. Winter Is Coming');
    expect(text).toContain('Lord Eddard Stark is troubled by reports.');
    expect(text).toContain('2011-04-17');
    expect(text).toContain('62 min');
    expect(text).toContain('2. The Kingsroad');
    expect(text).toContain('56 min');
  });

  it('should render the season overview when provided', () => {
    createComponent(1399, 1);

    expect(fixture.debugElement.nativeElement.textContent).toContain('The Stark family heads to Kings Landing.');
  });

  it('should render an empty-state message when the season has no episodes', () => {
    getSeasonDetailsSpy.mockReturnValue(of({ ...seasonDetails, episodes: [] }));

    createComponent(1399, 1);

    expect(fixture.debugElement.queryAll(By.css('ol li'))).toHaveLength(0);
    expect(fixture.debugElement.nativeElement.textContent).toContain('No episodes available');
  });

  [
    { description: 'season overview when overview is empty', overrides: { overview: '' }, missing: 'The Stark family heads to Kings Landing.' },
    {
      description: 'episode air date when air_date is empty',
      overrides: { episodes: [{ ...seasonDetails.episodes[0], air_date: '' }] },
      missing: '2011-04-17'
    },
    {
      description: 'episode runtime row when runtime is null',
      overrides: { episodes: [{ ...seasonDetails.episodes[0], runtime: null }] },
      missing: '62 min'
    },
    {
      description: 'episode overview when overview is empty',
      overrides: { episodes: [{ ...seasonDetails.episodes[0], overview: '' }] },
      missing: 'Lord Eddard Stark is troubled by reports.'
    }
  ].forEach(({ description, overrides, missing }) => {
    it(`should not render the ${description}`, () => {
      getSeasonDetailsSpy.mockReturnValue(of({ ...seasonDetails, ...overrides }));

      createComponent(1399, 1);

      expect(fixture.debugElement.nativeElement.textContent).not.toContain(missing);
    });
  });

  it('should forward an error message to LoadingShell when the request fails', () => {
    getSeasonDetailsSpy.mockReturnValue(throwError(() => new Error('boom')));

    createComponent(1399, 1);

    const loadingShell = fixture.debugElement.query(By.directive(LoadingShell)).componentInstance as LoadingShell;
    expect(loadingShell.errorMessage()).toContain('Unable to load season');
  });
});
