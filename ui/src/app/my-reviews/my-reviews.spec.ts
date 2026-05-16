import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { MaterialTesting, provideRoutingTesting } from '@testing';

import { AuthenticationService } from '../authentication/authentication.service';
import { Review, ReviewsService } from '../reviews/reviews.service';
import { MediaDetailService } from '../media-detail/media-detail.service';
import { MyReviews } from './my-reviews';
import { MyReviewItem } from './my-review-item/my-review-item';

const reviewOne: Review = {
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

const reviewTwo: Review = {
  id: 'r2',
  userId: 'u1',
  username: 'alice',
  mediaType: 'Series',
  tmdbId: 99,
  rating: 4,
  comment: 'Nice',
  createdAt: '2026-05-03T12:00:00Z',
  updatedAt: '2026-05-03T12:00:00Z',
  seasons: null
};

describe('MyReviews', () => {
  let fixture: ComponentFixture<MyReviews>;
  let materialTesting: MaterialTesting<MyReviews>;
  let reviewsService: { getUserReviews: Mock<(userId: string) => Observable<Review[]>> };
  let currentUserId: WritableSignal<string | null>;

  beforeEach(() => {
    reviewsService = { getUserReviews: vi.fn() };
    currentUserId = signal<string | null>('u1');

    TestBed.configureTestingModule({
      imports: [MyReviews],
      providers: [
        provideRoutingTesting(),
        { provide: ReviewsService, useValue: reviewsService },
        { provide: AuthenticationService, useValue: { currentUserId } },
        { provide: MediaDetailService, useValue: { getMovieDetails: () => of({ title: '' }), getSeriesDetails: () => of({ name: '' }) } }
      ],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(MyReviews);
    materialTesting = new MaterialTesting(fixture);
  });

  it("should request the current user's reviews", () => {
    reviewsService.getUserReviews.mockReturnValue(of([reviewOne, reviewTwo]));

    fixture.detectChanges();

    expect(reviewsService.getUserReviews).toHaveBeenCalledExactlyOnceWith('u1');
  });

  it('should render one card per review sorted by most recent', () => {
    reviewsService.getUserReviews.mockReturnValue(of([reviewOne, reviewTwo]));

    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.directive(MyReviewItem));
    const renderedIds = items.map((item) => (item.componentInstance as MyReviewItem).review().id);

    expect(renderedIds).toEqual([reviewTwo.id, reviewOne.id]);
  });

  it('should show a loading spinner while the request is pending', async () => {
    const pending = new Subject<Review[]>();
    reviewsService.getUserReviews.mockReturnValue(pending.asObservable());

    fixture.detectChanges();

    const spinnerExists = await materialTesting.matProgressSpinner.exists();

    expect(spinnerExists).toBe(true);
  });

  it('should show an empty state when the user has no reviews', () => {
    reviewsService.getUserReviews.mockReturnValue(of([]));

    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement as HTMLElement;
    expect(host.textContent).toContain('You have not written any reviews yet.');
  });

  it('should show an error message when loading fails', () => {
    reviewsService.getUserReviews.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert.nativeElement.textContent).toContain('Unable to load your reviews. Please try again.');
  });
});
