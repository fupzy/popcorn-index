import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, Subject, throwError } from 'rxjs';
import { Mock } from 'vitest';

import { MaterialTesting } from '@testing';

import { RatingStars } from '../rating-stars/rating-stars';
import { CreateReviewCommand, Review, ReviewsService, UpdateReviewCommand } from '../reviews.service';
import { ReviewFormDialog, ReviewFormDialogData } from './review-form-dialog';

const existingReview: Review = {
  id: 'r1',
  userId: 'u1',
  username: 'alice',
  mediaType: 'Series',
  tmdbId: 99,
  rating: 8,
  comment: 'Existing comment',
  createdAt: '2026-05-01T12:00:00Z',
  updatedAt: '2026-05-02T12:00:00Z',
  seasons: [{ seasonNumber: 1, rating: 6, comment: 'Solid start' }]
};

const createData: ReviewFormDialogData = {
  mediaType: 'Movie',
  tmdbId: 42,
  userId: 'u1',
  seasons: [],
  existingReview: null
};

const editData: ReviewFormDialogData = {
  mediaType: 'Series',
  tmdbId: 99,
  userId: 'u1',
  seasons: [
    { seasonNumber: 1, name: 'Season 1' },
    { seasonNumber: 2, name: 'Season 2' }
  ],
  existingReview
};

const clickStar = (ratingStars: DebugElement, value: number): void => {
  const buttons = ratingStars.queryAll(By.css('button[role="radio"]'));

  buttons[value - 1].triggerEventHandler('click', null);
};

describe('ReviewFormDialog', () => {
  let fixture: ComponentFixture<ReviewFormDialog>;
  let component: ReviewFormDialog;
  let materialTesting: MaterialTesting<ReviewFormDialog>;
  let dialogRef: { close: Mock<(value: Review | null) => void> };
  let reviewsService: {
    createReview: Mock<(command: CreateReviewCommand) => Observable<Review>>;
    updateReview: Mock<(id: string, command: UpdateReviewCommand) => Observable<Review>>;
  };

  const setup = (data: ReviewFormDialogData) => {
    TestBed.configureTestingModule({
      imports: [ReviewFormDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ReviewsService, useValue: reviewsService }
      ],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(ReviewFormDialog);
    component = fixture.componentInstance;
    materialTesting = new MaterialTesting(fixture);
    fixture.detectChanges();
  };

  beforeEach(() => {
    dialogRef = { close: vi.fn() };
    reviewsService = {
      createReview: vi.fn(),
      updateReview: vi.fn()
    };
  });

  it('should display "Write a review" title when there is no existing review', () => {
    setup(createData);

    expect(fixture.debugElement.nativeElement.textContent).toContain('Write a review');
  });

  it('should display "Edit your review" title and pre-fill the form when editing', async () => {
    setup(editData);

    const text = fixture.debugElement.nativeElement.textContent;
    const commentValue = await materialTesting.matFormField.getMatInputValue(/Comment/);

    expect(text).toContain('Edit your review');
    expect(commentValue).toBe('Existing comment');
  });

  it('should disable submit when rating is 0', async () => {
    setup(createData);

    const isDisabled = await materialTesting.matButton.isDisabled(/Publish/);

    expect(isDisabled).toBe(true);
  });

  it('should call createReview with form values when submitting a new review', async () => {
    reviewsService.createReview.mockReturnValue(of({ ...existingReview, id: 'new', rating: 10, comment: 'Brand new' }));
    setup(createData);
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    await materialTesting.matFormField.setMatInputValue(/Comment/, 'Brand new');
    fixture.detectChanges();

    await materialTesting.matButton.click(/Publish/);

    expect(reviewsService.createReview).toHaveBeenCalledExactlyOnceWith({
      userId: 'u1',
      mediaType: 'Movie',
      tmdbId: 42,
      rating: 10,
      comment: 'Brand new',
      seasons: null
    });
  });

  it('should close the dialog with the created review on success', async () => {
    const created: Review = { ...existingReview, id: 'new', rating: 10, comment: 'Brand new' };
    reviewsService.createReview.mockReturnValue(of(created));
    setup(createData);
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    fixture.detectChanges();

    await materialTesting.matButton.click(/Publish/);

    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith(created);
  });

  it('should call updateReview when submitting an existing review', async () => {
    const updated: Review = { ...existingReview, rating: 10 };
    reviewsService.updateReview.mockReturnValue(of(updated));
    setup(editData);
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    fixture.detectChanges();

    await materialTesting.matButton.click(/Save/);

    expect(reviewsService.updateReview).toHaveBeenCalledOnce();
    expect(reviewsService.updateReview.mock.calls[0][0]).toBe('r1');
    expect(reviewsService.updateReview.mock.calls[0][1].rating).toBe(10);
  });

  it('should display an error message when saving fails', async () => {
    reviewsService.createReview.mockReturnValue(throwError(() => new Error('boom')));
    setup(createData);
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    fixture.detectChanges();

    await materialTesting.matButton.click(/Publish/);

    expect(fixture.debugElement.nativeElement.textContent).toContain('Unable to save your review');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close the dialog with null when Cancel is clicked', async () => {
    setup(createData);

    await materialTesting.matButton.click(/Cancel/);

    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('should render one form row per provided season', () => {
    setup(editData);

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('Season 1');
    expect(text).toContain('Season 2');
    expect(component).toBeTruthy();
  });

  it('should send only seasons that received a rating in the create payload', async () => {
    reviewsService.createReview.mockReturnValue(of(existingReview));
    setup({ ...createData, mediaType: 'Series', seasons: editData.seasons });
    const allStars = fixture.debugElement.queryAll(By.directive(RatingStars));
    clickStar(allStars[0], 8);
    clickStar(allStars[1], 6);
    fixture.detectChanges();

    await materialTesting.matButton.click(/Publish/);

    expect(reviewsService.createReview.mock.calls[0][0].seasons).toEqual([{ seasonNumber: 1, rating: 6, comment: null }]);
  });

  it('should send seasons as null when none received a rating', async () => {
    reviewsService.createReview.mockReturnValue(of(existingReview));
    setup({ ...createData, mediaType: 'Series', seasons: editData.seasons });
    clickStar(fixture.debugElement.queryAll(By.directive(RatingStars))[0], 8);
    fixture.detectChanges();

    await materialTesting.matButton.click(/Publish/);

    expect(reviewsService.createReview.mock.calls[0][0].seasons).toBeNull();
  });

  it('should disable submit when a season has a comment but no rating', async () => {
    setup({ ...createData, mediaType: 'Series', seasons: editData.seasons });
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    const seasonInputs = fixture.debugElement.queryAll(By.css('textarea[formControlName="comment"]'));
    seasonInputs[1].nativeElement.value = 'Loved this season';
    seasonInputs[1].nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const isDisabled = await materialTesting.matButton.isDisabled(/Publish/);

    expect(isDisabled).toBe(true);
  });

  it('should ignore submit when the form is invalid', () => {
    setup(createData);

    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));

    expect(reviewsService.createReview).not.toHaveBeenCalled();
  });

  it('should ignore a second submit while the first is still in flight', async () => {
    const inFlight = new Subject<Review>();
    reviewsService.createReview.mockReturnValue(inFlight);
    setup(createData);
    clickStar(fixture.debugElement.query(By.directive(RatingStars)), 10);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));

    expect(reviewsService.createReview).toHaveBeenCalledOnce();
  });
});
