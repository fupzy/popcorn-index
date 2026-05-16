import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CreateReviewCommand, Review, ReviewsService, UpdateReviewCommand } from './reviews.service';

const baseUrl = '/popcorn-index/api/v1/reviews';

const mockReview: Review = {
  id: '11111111-1111-1111-1111-111111111111',
  userId: '22222222-2222-2222-2222-222222222222',
  username: 'alice',
  mediaType: 'Movie',
  tmdbId: 42,
  rating: 4,
  comment: 'Great movie',
  createdAt: '2026-05-01T12:00:00Z',
  updatedAt: '2026-05-01T12:00:00Z',
  seasons: null
};

describe('ReviewsService', () => {
  let service: ReviewsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ReviewsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should GET movie reviews', () => {
    let received: Review[] | undefined;
    service.getMovieReviews(42).subscribe((reviews) => (received = reviews));

    const request = httpTesting.expectOne(`${baseUrl}/movies/42`);
    expect(request.request.method).toBe('GET');
    request.flush([mockReview]);

    expect(received).toEqual([mockReview]);
  });

  it('should GET series reviews', () => {
    let received: Review[] | undefined;
    service.getSeriesReviews(99).subscribe((reviews) => (received = reviews));

    const request = httpTesting.expectOne(`${baseUrl}/series/99`);
    expect(request.request.method).toBe('GET');
    request.flush([mockReview]);

    expect(received).toEqual([mockReview]);
  });

  it('should GET user reviews', () => {
    let received: Review[] | undefined;
    service.getUserReviews(mockReview.userId).subscribe((reviews) => (received = reviews));

    const request = httpTesting.expectOne(`${baseUrl}/users/${mockReview.userId}`);
    expect(request.request.method).toBe('GET');
    request.flush([mockReview]);

    expect(received).toEqual([mockReview]);
  });

  it('should POST to create a review', () => {
    const command: CreateReviewCommand = {
      userId: mockReview.userId,
      mediaType: 'Movie',
      tmdbId: 42,
      rating: 5,
      comment: 'Excellent',
      seasons: null
    };

    let created: Review | undefined;
    service.createReview(command).subscribe((review) => (created = review));

    const request = httpTesting.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(command);
    request.flush({ ...mockReview, rating: 5, comment: 'Excellent' });

    expect(created?.rating).toBe(5);
  });

  it('should PUT to update a review', () => {
    const command: UpdateReviewCommand = { rating: 3, comment: null, seasons: null };

    let updated: Review | undefined;
    service.updateReview(mockReview.id, command).subscribe((review) => (updated = review));

    const request = httpTesting.expectOne(`${baseUrl}/${mockReview.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(command);
    request.flush({ ...mockReview, rating: 3, comment: null });

    expect(updated?.rating).toBe(3);
  });
});
