import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { provideRoutingTesting } from '@testing';

import { Home } from './home/home';
import { NotFound } from './not-found/not-found';
import { Login } from './authentication/login/login';
import { Register } from './authentication/register/register';
import { AuthenticationService } from './authentication/authentication.service';
import { MediaDetailService } from './media-detail/media-detail.service';
import { MovieDetail } from './media-detail/movie-detail/movie-detail';
import { SeriesDetail } from './media-detail/series-detail/series-detail';
import { Search } from './search/search/search';
import { SearchService } from './search/search.service';
import { MyReviews } from './my-reviews/my-reviews';
import { ReviewsService } from './reviews/reviews.service';

describe('App Routes', () => {
  let harness: RouterTestingHarness;
  let isAuthenticated: WritableSignal<boolean>;

  beforeEach(async () => {
    isAuthenticated = signal(true);

    TestBed.configureTestingModule({
      providers: [
        provideRoutingTesting(),
        { provide: SearchService, useValue: { search: () => of(null), getLanguages: () => of([]) } },
        { provide: MediaDetailService, useValue: { getMovieDetails: () => of(null), getSeriesDetails: () => of(null) } },
        { provide: ReviewsService, useValue: { getUserReviews: () => of([]) } },
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated, currentUserId: signal('user-1') }
        }
      ],
      teardown: { destroyAfterEach: true }
    });

    harness = await RouterTestingHarness.create();
  });

  [
    { url: '/home', expected: Home },
    { url: '', expected: Home },
    { url: '/search', expected: Search },
    { url: '/movie-detail/603', expected: MovieDetail },
    { url: '/series-detail/1399', expected: SeriesDetail },
    { url: '/my-reviews', expected: MyReviews },
    { url: '/login', expected: Login },
    { url: '/register', expected: Register },
    { url: '/unknown', expected: NotFound },
    { url: '/angular', expected: NotFound },
    { url: '/this/route/does/not/exists', expected: NotFound },
    { url: '/hello', expected: NotFound }
  ].forEach(({ url, expected }) => {
    it(`should navigate to ${expected.name} component for "${url}" route`, async () => {
      const component = await harness.navigateByUrl(url);

      expect(component).toBeInstanceOf(expected);
    });
  });

  it('should redirect to Login when navigating to "/my-reviews" while unauthenticated', async () => {
    isAuthenticated.set(false);

    const component = await harness.navigateByUrl('/my-reviews');

    expect(component).toBeInstanceOf(Login);
  });
});
