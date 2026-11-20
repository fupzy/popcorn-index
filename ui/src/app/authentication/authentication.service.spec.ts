import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TEST_USER_ID, provideRoutingTesting, unsignedJwtExpiringIn, unsignedJwtWithClaims } from '@testing';

import { AUTH_TOKEN_STORAGE_KEY, AuthenticationService } from './authentication.service';

const validToken = unsignedJwtWithClaims({ sub: TEST_USER_ID, exp: 4102444800 });

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRoutingTesting()],
      teardown: { destroyAfterEach: true }
    });

    service = TestBed.inject(AuthenticationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should POST the credentials to the register endpoint', () => {
      service.register('alice', 'secret-pw').subscribe();

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');

      expect(request.request.method).toEqual('POST');
      expect(request.request.body).toEqual({ username: 'alice', password: 'secret-pw' });
    });

    it('should emit and complete when the server returns a success response', () => {
      const next = vi.fn();
      const complete = vi.fn();

      service.register('alice', 'secret-pw').subscribe({ next, complete });

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');
      request.flush(null);

      expect(next).toHaveBeenCalledTimes(1);
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error when the server returns an error response', () => {
      let receivedError: HttpErrorResponse | undefined;

      service.register('alice', 'secret-pw').subscribe({
        error: (error: HttpErrorResponse) => {
          receivedError = error;
        }
      });

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/register');
      request.flush({ errors: { Username: ['Username already taken'] } }, { status: 400, statusText: 'Bad Request' });

      expect(receivedError).toBeDefined();
      expect(receivedError?.status).toEqual(400);
      expect(receivedError?.error).toEqual({ errors: { Username: ['Username already taken'] } });
    });
  });

  describe('login', () => {
    it('should POST the credentials to the login endpoint', () => {
      service.login('alice', 'secret-pw').subscribe();

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');

      expect(request.request.method).toEqual('POST');
      expect(request.request.body).toEqual({ username: 'alice', password: 'secret-pw' });
    });

    it('should emit the token and complete when the server returns a success response', () => {
      const next = vi.fn();
      const complete = vi.fn();

      service.login('alice', 'secret-pw').subscribe({ next, complete });

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
      request.flush({ token: validToken });

      expect(next).toHaveBeenCalledWith({ token: validToken });
      expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should propagate the error when the server returns 401', () => {
      let receivedError: HttpErrorResponse | undefined;

      service.login('alice', 'wrong-pw').subscribe({
        error: (error: HttpErrorResponse) => {
          receivedError = error;
        }
      });

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
      request.flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(receivedError).toBeDefined();
      expect(receivedError?.status).toEqual(401);
    });

    it('should persist the token in localStorage on success', () => {
      service.login('alice', 'secret-pw').subscribe();

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
      request.flush({ token: validToken });

      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toEqual(validToken);
    });

    it('should not persist a token in localStorage when the server returns an error', () => {
      service.login('alice', 'wrong-pw').subscribe({ error: () => undefined });

      const request = httpTesting.expectOne('/popcorn-index/api/v1/authentication/login');
      request.flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return the token stored by a successful login', () => {
      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: validToken });

      expect(service.getToken()).toEqual(validToken);
    });

    it('should return null when no token has been stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should be false when no token has been stored', () => {
      expect(service.isAuthenticated()).toEqual(false);
    });

    it('should be true once a login succeeds and false again after logout', () => {
      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: validToken });

      expect(service.isAuthenticated()).toEqual(true);

      service.logout();

      expect(service.isAuthenticated()).toEqual(false);
    });
  });

  describe('logout', () => {
    it('should clear the persisted token', () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, validToken);

      service.logout();

      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should hydrate the token from localStorage when the service is constructed', () => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, validToken);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRoutingTesting()],
        teardown: { destroyAfterEach: true }
      });

      const freshService = TestBed.inject(AuthenticationService);

      expect(freshService.getToken()).toEqual(validToken);
      expect(freshService.isAuthenticated()).toEqual(true);
    });

    it('should discard a persisted token that is already expired', () => {
      const expiredToken = unsignedJwtExpiringIn(-60);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, expiredToken);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRoutingTesting()],
        teardown: { destroyAfterEach: true }
      });

      const freshService = TestBed.inject(AuthenticationService);

      expect(freshService.getToken()).toBeNull();
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    });
  });

  describe('token acceptance', () => {
    [
      { description: 'is not a three-segment JWT', token: 'toto' },
      { description: 'has a payload that does not decode to valid JSON', token: `header.${btoa('not-json')}.signature` },
      { description: 'carries no exp claim', token: unsignedJwtWithClaims({ sub: TEST_USER_ID }) },
      { description: 'carries no sub claim', token: unsignedJwtWithClaims({ exp: 4102444800 }) },
      { description: 'is already expired', token: unsignedJwtExpiringIn(-60) }
    ].forEach(({ description, token }) => {
      it(`should reject a token that ${description}`, () => {
        service.login('alice', 'secret-pw').subscribe();
        httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token });

        expect(service.isAuthenticated()).toEqual(false);
        expect(service.getToken()).toBeNull();
        expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      });
    });

    it('should end the current session when a rejected token is adopted', () => {
      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: validToken });

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: 'toto' });

      expect(service.isAuthenticated()).toEqual(false);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    });
  });

  describe('tokenExpiresAt', () => {
    it('should be null when no token is stored', () => {
      expect(service.tokenExpiresAt()).toBeNull();
    });

    it('should expose the exp claim as a Date for a valid JWT', () => {
      const expSeconds = Math.floor(Date.now() / 1000) + 3600;
      const token = unsignedJwtWithClaims({ sub: TEST_USER_ID, exp: expSeconds });

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token });

      expect(service.tokenExpiresAt()?.getTime()).toEqual(expSeconds * 1000);
    });

    it('should become null again after logout', () => {
      const token = unsignedJwtExpiringIn(3600);

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token });

      service.logout();

      expect(service.tokenExpiresAt()).toBeNull();
    });
  });

  describe('auto-logout on token expiration', () => {
    it('should log the user out and redirect to /login when the token reaches its expiration time', () => {
      vi.useFakeTimers({ shouldAdvanceTime: false });
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');
      const token = unsignedJwtExpiringIn(60);

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token });

      expect(service.isAuthenticated()).toEqual(true);

      vi.advanceTimersByTime(60 * 1000);

      expect(service.isAuthenticated()).toEqual(false);
      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should cancel the previous timer when a new token is adopted', () => {
      vi.useFakeTimers({ shouldAdvanceTime: false });
      const shortLivedToken = unsignedJwtExpiringIn(60);
      const longLivedToken = unsignedJwtExpiringIn(3600);

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: shortLivedToken });

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: longLivedToken });

      vi.advanceTimersByTime(60 * 1000);

      expect(service.isAuthenticated()).toEqual(true);
    });

    it('should cancel the scheduled timer when logout is called manually', () => {
      vi.useFakeTimers({ shouldAdvanceTime: false });
      const token = unsignedJwtExpiringIn(60);
      const logoutSpy = vi.spyOn(service, 'logout');

      service.login('alice', 'secret-pw').subscribe();
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token });

      service.logout();
      logoutSpy.mockClear();

      vi.advanceTimersByTime(10 * 60 * 1000);

      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });
});
