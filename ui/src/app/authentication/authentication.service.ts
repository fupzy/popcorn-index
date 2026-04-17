import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

/**
 * Shape of the response body returned by the `login` endpoint
 * on success. Mirrors the backend `LoginResponse` record.
 */
export interface LoginResponse {
  token: string;
}

/**
 * localStorage key under which the JWT token issued by the
 * backend on successful login is persisted.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'popcorn-index:auth-token';

/**
 * Handles authentication-related HTTP interactions
 * (register, login, ...) against the Popcorn Index API.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  /**
   * Reactive view of the JWT token persisted on the last successful login.
   * Emits `null` when no token is currently stored.
   */
  public readonly token: Signal<string | null>;

  /**
   * Reactive flag indicating whether a token is currently stored.
   */
  public readonly isAuthenticated: Signal<boolean>;

  private readonly baseUrl = '/popcorn-index/api/v1/authentication';

  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));

  constructor() {
    this.token = this.tokenSignal.asReadonly();
    this.isAuthenticated = computed(() => this.tokenSignal() !== null);
  }

  /**
   * Registers a new user with the given credentials.
   *
   * @param username Desired username.
   * @param password Plain-text password, transmitted over HTTPS.
   * @returns Observable that completes when the server acknowledges the registration.
   */
  public register(username: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, { username, password });
  }

  /**
   * Authenticates an existing user with the given credentials.
   * Persists the issued token in `localStorage` as a side effect
   * so it can be reused by subsequent requests.
   *
   * @param username Account username.
   * @param password Plain-text password, transmitted over HTTPS.
   * @returns Observable emitting the issued JWT token on success.
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
        this.tokenSignal.set(response.token);
      })
    );
  }

  /**
   * Clears the persisted token. Subsequent requests that rely on
   * authentication will need to log in again.
   */
  public logout(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    this.tokenSignal.set(null);
  }

  /**
   * Returns the JWT token persisted on the last successful login,
   * or `null` if no token is currently stored.
   */
  public getToken(): string | null {
    return this.tokenSignal();
  }
}
