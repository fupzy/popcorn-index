import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { signal, WritableSignal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { MaterialTesting } from '@testing';

import { AuthenticationService } from '../../authentication/authentication.service';
import { RatingStars } from '../rating-stars/rating-stars';
import { Review, ReviewsService } from '../reviews.service';
import { ReviewCard } from '../review-card/review-card';
import { ReviewFormDialog, ReviewFormDialogData } from '../review-form-dialog/review-form-dialog';
import { ReviewsSection } from './reviews-section';

const aliceReview: Review = {
  id: 'r1',
  userId: 'u1',
  username: 'alice',
  mediaType: 'Movie',
  tmdbId: 42,
  rating: 5,
  comment: 'Loved it',
  createdAt: '2026-05-01T12:00:00Z',
  updatedAt: '2026-05-03T12:00:00Z',
  seasons: null
};

const bobReview: Review = {
  id: 'r2',
  userId: 'u2',
  username: 'bob',
  mediaType: 'Movie',
  tmdbId: 42,
  rating: 2,
  comment: 'Meh',
  createdAt: '2026-05-02T12:00:00Z',
  updatedAt: '2026-05-02T12:00:00Z',
  seasons: null
};

describe('ReviewsSection', () => {
  let fixture: ComponentFixture<ReviewsSection>;
  let loader: HarnessLoader;
  let materialTesting: MaterialTesting<ReviewsSection>;
  let reviewsService: {
    getMovieReviews: Mock<(tmdbId: number) => Observable<Review[]>>;
    getSeriesReviews: Mock<(tmdbId: number) => Observable<Review[]>>;
  };
  type DialogOpenFn = (component: unknown, config: { data: ReviewFormDialogData }) => MatDialogRef<ReviewFormDialog, Review | null>;
  let dialog: { open: Mock<DialogOpenFn> };
  let currentUserId: WritableSignal<string | null>;

  const setup = (inputs: { mediaType: 'Movie' | 'Series'; tmdbId: number }, reviewsFromBackend: Review[] = []) => {
    reviewsService.getMovieReviews.mockReturnValue(of(reviewsFromBackend));
    reviewsService.getSeriesReviews.mockReturnValue(of(reviewsFromBackend));

    TestBed.configureTestingModule({
      imports: [ReviewsSection],
      providers: [
        { provide: ReviewsService, useValue: reviewsService },
        { provide: AuthenticationService, useValue: { currentUserId } },
        { provide: MatDialog, useValue: dialog }
      ],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(ReviewsSection);
    loader = TestbedHarnessEnvironment.loader(fixture);
    materialTesting = new MaterialTesting(fixture);
    fixture.componentRef.setInput('mediaType', inputs.mediaType);
    fixture.componentRef.setInput('tmdbId', inputs.tmdbId);
    fixture.detectChanges();
  };

  beforeEach(() => {
    reviewsService = {
      getMovieReviews: vi.fn(),
      getSeriesReviews: vi.fn()
    };
    dialog = { open: vi.fn() };
    currentUserId = signal<string | null>(null);
  });

  it('should call getMovieReviews when mediaType is Movie', () => {
    setup({ mediaType: 'Movie', tmdbId: 42 });

    expect(reviewsService.getMovieReviews).toHaveBeenCalledExactlyOnceWith(42);
    expect(reviewsService.getSeriesReviews).not.toHaveBeenCalled();
  });

  it('should call getSeriesReviews when mediaType is Series', () => {
    setup({ mediaType: 'Series', tmdbId: 99 });

    expect(reviewsService.getSeriesReviews).toHaveBeenCalledExactlyOnceWith(99);
    expect(reviewsService.getMovieReviews).not.toHaveBeenCalled();
  });

  it('should display "No reviews yet." when the list is empty', () => {
    setup({ mediaType: 'Movie', tmdbId: 42 }, []);

    expect(fixture.debugElement.nativeElement.textContent).toContain('No reviews yet.');
  });

  it('should display the average rating and review count when reviews are loaded', () => {
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview, bobReview]);

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('3.5 / 5');
    expect(text).toContain('2 reviews');
  });

  it('should pass the average rounded to the nearest integer to the header RatingStars', () => {
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview, bobReview]);

    const stars = fixture.debugElement.query(By.directive(RatingStars)).componentInstance as RatingStars;

    expect(stars.value()).toBe(4);
  });

  it('should hide the Write a review button when user is not authenticated', async () => {
    setup({ mediaType: 'Movie', tmdbId: 42 }, []);

    const writeButtonExists = await materialTesting.matButton.exists(/Write a review/);

    expect(writeButtonExists).toBe(false);
  });

  it('should show the Write a review button when user is authenticated and has no own review', async () => {
    currentUserId.set('u-new');
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview]);

    const writeButtonExists = await materialTesting.matButton.exists(/Write a review/);
    const editButtonExists = await materialTesting.matButton.exists(/Edit my review/);

    expect(writeButtonExists).toBe(true);
    expect(editButtonExists).toBe(false);
  });

  it('should show the Edit my review button when the user has already reviewed', async () => {
    currentUserId.set('u1');
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview, bobReview]);

    const editButtonExists = await materialTesting.matButton.exists(/Edit my review/);

    expect(editButtonExists).toBe(true);
  });

  it('should mark the own review as owner and exclude it from the other reviews list', () => {
    currentUserId.set('u1');
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview, bobReview]);

    const cards = fixture.debugElement.queryAll(By.directive(ReviewCard));

    expect(cards.length).toBe(2);
    const ownerCard = cards[0].componentInstance as ReviewCard;
    const otherCard = cards[1].componentInstance as ReviewCard;
    expect(ownerCard.review().id).toBe('r1');
    expect(ownerCard.isOwner()).toBe(true);
    expect(otherCard.review().id).toBe('r2');
    expect(otherCard.isOwner()).toBe(false);
  });

  it('should open the dialog with the form data when Write a review is clicked', async () => {
    currentUserId.set('u-new');
    dialog.open.mockReturnValue({ afterClosed: () => of(null) } as unknown as MatDialogRef<ReviewFormDialog, Review | null>);
    setup({ mediaType: 'Movie', tmdbId: 42 }, []);

    await materialTesting.matButton.click(/Write a review/);

    expect(dialog.open).toHaveBeenCalledOnce();
    const data = dialog.open.mock.calls[0][1].data;
    expect(data).toEqual({
      mediaType: 'Movie',
      tmdbId: 42,
      userId: 'u-new',
      seasons: [],
      existingReview: null
    });
  });

  it('should replace the own review in place when the user edits and saves it', async () => {
    currentUserId.set('u1');
    const afterClosed$ = new Subject<Review | null>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ } as unknown as MatDialogRef<ReviewFormDialog, Review | null>);
    setup({ mediaType: 'Movie', tmdbId: 42 }, [aliceReview, bobReview]);

    await materialTesting.matButton.click(/Edit my review/);
    afterClosed$.next({ ...aliceReview, rating: 1, comment: 'Changed my mind' });
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Changed my mind');
    expect(fixture.debugElement.nativeElement.textContent).not.toContain('Loved it');
  });

  it('should fall back to date desc as tie-breaker when ratings are equal in "Top rated"', async () => {
    const older = { ...bobReview, id: 'rOld', rating: 4, updatedAt: '2026-05-01T00:00:00Z' };
    const newer = { ...bobReview, id: 'rNew', rating: 4, updatedAt: '2026-05-04T00:00:00Z' };
    setup({ mediaType: 'Movie', tmdbId: 42 }, [older, newer]);

    const toggle = await loader.getHarness(MatButtonToggleGroupHarness);
    const toggles = await toggle.getToggles({ text: /Top rated/ });
    await toggles[0].check();

    const cards = fixture.debugElement.queryAll(By.directive(ReviewCard));
    expect((cards[0].componentInstance as ReviewCard).review().id).toBe('rNew');
    expect((cards[1].componentInstance as ReviewCard).review().id).toBe('rOld');
  });

  it('should sort other reviews by rating descending when "Top rated" is selected', async () => {
    const high = { ...bobReview, id: 'rH', rating: 5, updatedAt: '2026-05-01T00:00:00Z' };
    const low = { ...bobReview, id: 'rL', rating: 1, updatedAt: '2026-05-04T00:00:00Z' };
    setup({ mediaType: 'Movie', tmdbId: 42 }, [low, high]);

    const toggle = await loader.getHarness(MatButtonToggleGroupHarness);
    const toggles = await toggle.getToggles({ text: /Top rated/ });
    await toggles[0].check();

    const cards = fixture.debugElement.queryAll(By.directive(ReviewCard));
    expect((cards[0].componentInstance as ReviewCard).review().id).toBe('rH');
    expect((cards[1].componentInstance as ReviewCard).review().id).toBe('rL');
  });

  it('should show a loading spinner while reviews are loading', async () => {
    reviewsService.getMovieReviews.mockReturnValue(new Subject<Review[]>());

    TestBed.configureTestingModule({
      imports: [ReviewsSection],
      providers: [
        { provide: ReviewsService, useValue: reviewsService },
        { provide: AuthenticationService, useValue: { currentUserId } },
        { provide: MatDialog, useValue: dialog }
      ],
      teardown: { destroyAfterEach: true }
    });
    fixture = TestBed.createComponent(ReviewsSection);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.componentRef.setInput('mediaType', 'Movie');
    fixture.componentRef.setInput('tmdbId', 42);
    fixture.detectChanges();

    const spinner = await loader.getHarnessOrNull(MatProgressSpinnerHarness);

    expect(spinner).not.toBeNull();
  });

  it('should display an error message when loading reviews fails', () => {
    reviewsService.getMovieReviews.mockReturnValue(throwError(() => new Error('boom')));

    TestBed.configureTestingModule({
      imports: [ReviewsSection],
      providers: [
        { provide: ReviewsService, useValue: reviewsService },
        { provide: AuthenticationService, useValue: { currentUserId } },
        { provide: MatDialog, useValue: dialog }
      ],
      teardown: { destroyAfterEach: true }
    });
    fixture = TestBed.createComponent(ReviewsSection);
    fixture.componentRef.setInput('mediaType', 'Movie');
    fixture.componentRef.setInput('tmdbId', 42);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Unable to load reviews');
  });

  it('should add the saved review to the list when the dialog returns one', async () => {
    currentUserId.set('u-new');
    const afterClosed$ = new Subject<Review | null>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ } as unknown as MatDialogRef<ReviewFormDialog, Review | null>);
    const newReview: Review = { ...aliceReview, id: 'r3', userId: 'u-new', username: 'carol' };
    setup({ mediaType: 'Movie', tmdbId: 42 }, []);

    await materialTesting.matButton.click(/Write a review/);
    afterClosed$.next(newReview);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('carol');
  });
});
