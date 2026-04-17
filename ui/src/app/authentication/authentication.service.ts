import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
 * Subset of the JWT payload we inspect client-side to schedule
 * auto-logout. The signature is NOT verified here; this decoding
 * is only ever used to drive UX (expiry countdown / auto-logout),
 * never to gate authorization decisions.
 */
interface JwtPayload {
  readonly exp?: number;
}

/**
 * Decodes the payload segment of a JWT. Returns `null` when the
 * token is not a well-formed three-segment JWT or when the payload
 * is not valid JSON.
 */
const decodeJwtPayload = (token: string): JwtPayload | null => {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  try {
    const base64Url = segments[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

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

  /**
   * Reactive view of the current token's expiration date, derived from
   * its JWT `exp` claim. `null` when no token is stored or the token
   * carries no `exp` claim.
   */
  public readonly tokenExpiresAt: Signal<Date | null>;

  private readonly baseUrl = '/popcorn-index/api/v1/authentication';

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(null);

  private autoLogoutTimeoutId: number | null = null;

  constructor() {
    this.token = this.tokenSignal.asReadonly();
    this.isAuthenticated = computed(() => this.tokenSignal() !== null);
    this.tokenExpiresAt = computed(() => {
      const current = this.tokenSignal();
      if (current === null) {
        return null;
      }

      const payload = decodeJwtPayload(current);
      return payload?.exp != null ? new Date(payload.exp * 1000) : null;
    });

    const stored = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (stored !== null) {
      this.applyToken(stored, false);
    }
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
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((response) => this.applyToken(response.token, true)));
  }

  /**
   * Clears the persisted token. Subsequent requests that rely on
   * authentication will need to log in again.
   */
  public logout(): void {
    this.clearAutoLogoutTimer();
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

  /**
   * Adopts the given token: stores it, publishes it to the signal,
   * and schedules auto-logout based on its `exp` claim. Already-expired
   * tokens are rejected and clear any prior session.
   *
   * @param token Raw JWT string to adopt.
   * @param persist Whether to write the token back to `localStorage`.
   *                `false` when hydrating from storage at startup.
   */
  private applyToken(token: string, persist: boolean): void {
    const payload = decodeJwtPayload(token);
    const expiresAtMs = payload?.exp != null ? payload.exp * 1000 : null;

    if (expiresAtMs !== null && expiresAtMs <= Date.now()) {
      this.logout();
      return;
    }

    if (persist) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
    this.tokenSignal.set(token);
    this.scheduleAutoLogout(expiresAtMs);
  }

  private scheduleAutoLogout(expiresAtMs: number | null): void {
    this.clearAutoLogoutTimer();
    if (expiresAtMs === null) {
      return;
    }

    const delay = expiresAtMs - Date.now();
    console.info(`Token expires in ${Math.round(delay / 1000)} seconds`);
    this.autoLogoutTimeoutId = setTimeout(() => {
      console.info('Token expired, logging out');
      this.logout();
      this.router.navigate(['/login']);
    }, delay);
  }

  private clearAutoLogoutTimer(): void {
    if (this.autoLogoutTimeoutId !== null) {
      clearTimeout(this.autoLogoutTimeoutId);
      this.autoLogoutTimeoutId = null;
    }
  }
}
