import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
}
