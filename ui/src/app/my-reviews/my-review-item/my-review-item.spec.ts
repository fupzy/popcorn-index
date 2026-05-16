import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideRoutingTesting } from '@testing';

import { Review } from '../../reviews/reviews.service';
import { ReviewCard } from '../../reviews/review-card/review-card';

import { MyReviewItem } from './my-review-item';

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

describe('MyReviewItem', () => {
  let fixture: ComponentFixture<MyReviewItem>;

  const setup = (review: Review): void => {
    fixture = TestBed.createComponent(MyReviewItem);
    fixture.componentRef.setInput('review', review);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyReviewItem],
      providers: [provideRoutingTesting()],
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

  it('should forward the review to the underlying review card as the owner', () => {
    setup(movieReview);

    const card = fixture.debugElement.query(By.directive(ReviewCard)).componentInstance as ReviewCard;
    expect(card.review()).toEqual(movieReview);
    expect(card.isOwner()).toBe(true);
  });
});
