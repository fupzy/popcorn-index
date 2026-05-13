import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type ReviewMediaType = 'Movie' | 'Series';

export interface SeasonReview {
  readonly seasonNumber: number;
  readonly rating: number;
  readonly comment: string | null;
}

export interface Review {
  readonly id: string;
  readonly userId: string;
  readonly username: string;
  readonly mediaType: ReviewMediaType;
  readonly tmdbId: number;
  readonly rating: number;
  readonly comment: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly seasons: SeasonReview[] | null;
}

export interface CreateReviewCommand {
  readonly userId: string;
  readonly mediaType: ReviewMediaType;
  readonly tmdbId: number;
  readonly rating: number;
  readonly comment: string | null;
  readonly seasons: SeasonReview[] | null;
}

export interface UpdateReviewCommand {
  readonly rating: number;
  readonly comment: string | null;
  readonly seasons: SeasonReview[] | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly baseUrl = '/popcorn-index/api/v1/reviews';

  private readonly httpClient = inject(HttpClient);

  public getMovieReviews(tmdbId: number): Observable<Review[]> {
    return this.httpClient.get<Review[]>(`${this.baseUrl}/movies/${tmdbId}`);
  }

  public getSeriesReviews(tmdbId: number): Observable<Review[]> {
    return this.httpClient.get<Review[]>(`${this.baseUrl}/series/${tmdbId}`);
  }

  public createReview(command: CreateReviewCommand): Observable<Review> {
    return this.httpClient.post<Review>(this.baseUrl, command);
  }

  public updateReview(id: string, command: UpdateReviewCommand): Observable<Review> {
    return this.httpClient.put<Review>(`${this.baseUrl}/${id}`, command);
  }
}
