import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of, Subject } from 'rxjs';
import { Mock } from 'vitest';

import { provideRoutingTesting } from '@testing';

import { MediaDetailService, TmdbMovieDetails, TmdbSeriesDetails } from '../../media-detail/media-detail.service';
import { Review } from '../../reviews/reviews.service';
import { ReviewCard } from '../../reviews/review-card/review-card';
import { MyReviewItem } from './my-review-item';

type GetMovieDetailsFn = (id: string) => Observable<TmdbMovieDetails>;
type GetSeriesDetailsFn = (id: string) => Observable<TmdbSeriesDetails>;

const movieReview: Review = {
  id: 'r1',
  userId: 'u1',
  username: 'alice',
  mediaType: 'Movie',
  tmdbId: 42,
  rating: 5,
  comment: 'Loved it',
  createdAt: '2026-05-01T12:00:00Z',
  updatedAt: '2026-05-01T12:00:00Z',
  seasons: null
};

const seriesReview: Review = { ...movieReview, id: 'r2', mediaType: 'Series', tmdbId: 99 };

const movieDetails: TmdbMovieDetails = {
  id: 42,
  title: 'The Matrix',
  overview: '',
  poster_path: null,
  release_date: '',
  vote_average: 0,
  runtime: null,
  tagline: '',
  genres: []
};

const seriesDetails: TmdbSeriesDetails = {
  id: 99,
  name: 'Breaking Bad',
  overview: '',
  poster_path: null,
  first_air_date: '',
  vote_average: 0,
  number_of_seasons: 1,
  tagline: '',
  genres: [],
  seasons: []
};

describe('MyReviewItem', () => {
  let fixture: ComponentFixture<MyReviewItem>;
  let getMovieDetailsSpy: Mock<GetMovieDetailsFn>;
  let getSeriesDetailsSpy: Mock<GetSeriesDetailsFn>;

  const setup = (review: Review): void => {
    fixture = TestBed.createComponent(MyReviewItem);
    fixture.componentRef.setInput('review', review);
    fixture.detectChanges();
  };

  beforeEach(() => {
    getMovieDetailsSpy = vi.fn<GetMovieDetailsFn>();
    getMovieDetailsSpy.mockReturnValue(of(movieDetails));
    getSeriesDetailsSpy = vi.fn<GetSeriesDetailsFn>();
    getSeriesDetailsSpy.mockReturnValue(of(seriesDetails));

    TestBed.configureTestingModule({
      imports: [MyReviewItem],
      providers: [
        provideRoutingTesting(),
        { provide: MediaDetailService, useValue: { getMovieDetails: getMovieDetailsSpy, getSeriesDetails: getSeriesDetailsSpy } }
      ],
      teardown: { destroyAfterEach: true }
    });
  });

  [
    { review: movieReview, expectedHref: '/movie-detail/42' },
    { review: seriesReview, expectedHref: '/series-detail/99' }
  ].forEach(({ review, expectedHref }) => {
    it(`should link to ${expectedHref} for ${review.mediaType} reviews`, () => {
      setup(review);

      const anchor = fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
      expect(anchor.getAttribute('href')).toEqual(expectedHref);
    });
  });

  it('should display the movie title fetched from the media detail service', () => {
    setup(movieReview);

    expect(getMovieDetailsSpy).toHaveBeenCalledExactlyOnceWith('42');
    expect(fixture.debugElement.nativeElement.textContent).toContain('The Matrix');
  });

  it('should display the series name fetched from the media detail service', () => {
    setup(seriesReview);

    expect(getSeriesDetailsSpy).toHaveBeenCalledExactlyOnceWith('99');
    expect(fixture.debugElement.nativeElement.textContent).toContain('Breaking Bad');
  });

  it('should display a loading placeholder while the media title is in-flight', () => {
    const pending = new Subject<TmdbMovieDetails>();
    getMovieDetailsSpy.mockReturnValue(pending.asObservable());

    setup(movieReview);

    expect(fixture.debugElement.nativeElement.textContent).toContain('Loading');
    expect(fixture.debugElement.nativeElement.textContent).not.toContain('The Matrix');
  });

  it('should forward the review to the underlying review card without owner actions', () => {
    setup(movieReview);

    const card = fixture.debugElement.query(By.directive(ReviewCard)).componentInstance as ReviewCard;
    expect(card.review()).toEqual(movieReview);
    expect(card.showOwnerActions()).toBe(false);
  });
});
