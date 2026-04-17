import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AUTH_TOKEN_STORAGE_KEY, AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true }
    });

    service = TestBed.inject(AuthenticationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
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
      request.flush({ token: 'jwt-token' });

      expect(next).toHaveBeenCalledWith({ token: 'jwt-token' });
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
      request.flush({ token: 'jwt-token' });

      expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toEqual('jwt-token');
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
      httpTesting.expectOne('/popcorn-index/api/v1/authentication/login').flush({ token: 'jwt-token' });

      expect(service.getToken()).toEqual('jwt-token');
    });

    it('should return null when no token has been stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});
