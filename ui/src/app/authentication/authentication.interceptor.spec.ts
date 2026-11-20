import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authenticationInterceptor } from './authentication.interceptor';
import { AuthenticationService } from './authentication.service';

describe('authenticationInterceptor', () => {
  const apiUrl = '/popcorn-index/api/v1/reviews';

  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let storedToken: string | null;

  beforeEach(() => {
    storedToken = null;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthenticationService, useValue: { getToken: (): string | null => storedToken } }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should attach the stored token as a bearer credential on API requests', () => {
    storedToken = 'a.b.c';

    httpClient.get(apiUrl).subscribe();

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.headers.get('Authorization')).toEqual('Bearer a.b.c');
    request.flush([]);
  });

  it('should leave API requests unauthenticated when no token is stored', () => {
    httpClient.get(apiUrl).subscribe();

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.headers.has('Authorization')).toEqual(false);
    request.flush([]);
  });

  it('should not leak the token to a request outside the API', () => {
    storedToken = 'a.b.c';

    httpClient.get('https://api.themoviedb.org/3/movie/550').subscribe();

    const request = httpTesting.expectOne('https://api.themoviedb.org/3/movie/550');

    expect(request.request.headers.has('Authorization')).toEqual(false);
    request.flush({});
  });
});
