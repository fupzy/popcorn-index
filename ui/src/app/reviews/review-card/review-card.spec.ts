import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';

import { RatingStars } from '../rating-stars/rating-stars';
import { Review } from '../reviews.service';
import { ReviewCard, ReviewSeason } from './review-card';

const mockReview: Review = {
  id: 'r1',
  userId: 'u1',
  username: 'alice',
  mediaType: 'Movie',
  tmdbId: 42,
  rating: 4,
  comment: 'Loved it',
  createdAt: '2026-05-01T12:00:00Z',
  updatedAt: '2026-05-02T12:00:00Z',
  seasons: null
};

describe('ReviewCard', () => {
  let fixture: ComponentFixture<ReviewCard>;
  let component: ReviewCard;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReviewCard],
      teardown: { destroyAfterEach: true }
    });

    fixture = TestBed.createComponent(ReviewCard);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should pass the review rating to the RatingStars child', () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.detectChanges();

    const stars = fixture.debugElement.query(By.directive(RatingStars)).componentInstance as RatingStars;

    expect(stars.value()).toBe(4);
  });

  it('should display the username and the comment', () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).toContain('alice');
    expect(text).toContain('Loved it');
  });

  it('should omit the username and the comment when they are not provided', () => {
    const review: Review = { ...mockReview, username: '', comment: null };
    fixture.componentRef.setInput('review', review);
    fixture.detectChanges();

    const text = fixture.debugElement.nativeElement.textContent;

    expect(text).not.toContain('alice');
    expect(text).not.toContain('Loved it');
  });

  it('should not display "Your review" badge when showOwnerActions is false', () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.componentRef.setInput('showOwnerActions', false);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).not.toContain('Your review');
  });

  it('should display "Your review" badge when showOwnerActions is true', () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.componentRef.setInput('showOwnerActions', true);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Your review');
  });

  it('should not render the actions menu when showOwnerActions is false', async () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.componentRef.setInput('showOwnerActions', false);
    fixture.detectChanges();

    const menu = await loader.getHarnessOrNull(MatMenuHarness);

    expect(menu).toBeNull();
  });

  it('should emit editRequested when the Edit menu item is clicked', async () => {
    fixture.componentRef.setInput('review', mockReview);
    fixture.componentRef.setInput('showOwnerActions', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.editRequested, 'emit');

    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    await menu.clickItem({ text: /Edit/ });

    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it('should use the provided season name for matching season ratings', () => {
    const review: Review = {
      ...mockReview,
      mediaType: 'Series',
      seasons: [{ seasonNumber: 1, rating: 4, comment: null }]
    };
    const seasons: ReviewSeason[] = [{ seasonNumber: 1, name: 'Pilot Season' }];
    fixture.componentRef.setInput('review', review);
    fixture.componentRef.setInput('seasons', seasons);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Pilot Season');
  });

  it('should display the season comment when one is provided', () => {
    const review: Review = {
      ...mockReview,
      mediaType: 'Series',
      seasons: [{ seasonNumber: 1, rating: 4, comment: 'Great first season' }]
    };
    fixture.componentRef.setInput('review', review);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Great first season');
  });

  it('should fall back to "Season N" when no name is provided for the season', () => {
    const review: Review = {
      ...mockReview,
      mediaType: 'Series',
      seasons: [{ seasonNumber: 3, rating: 5, comment: null }]
    };
    fixture.componentRef.setInput('review', review);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent).toContain('Season 3');
  });
});
