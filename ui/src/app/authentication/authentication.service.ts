import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Shape of the response body returned by the `login` endpoint
 * on success. Mirrors the backend `LoginResponse` record.
 */
export interface LoginResponse {
  token: string;
}

/**
 * Handles authentication-related HTTP interactions
 * (register, login, ...) against the Popcorn Index API.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly baseUrl = '/popcorn-index/api/v1/authentication';

  private readonly http = inject(HttpClient);

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
   *
   * @param username Account username.
   * @param password Plain-text password, transmitted over HTTPS.
   * @returns Observable emitting the issued JWT token on success.
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password });
  }
}
