import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { signal, Signal } from '@angular/core';

import { provideRoutingTesting } from '@testing';

import { authenticatedGuard } from './authenticated.guard';
import { AuthenticationService } from './authentication.service';

describe('authenticatedGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  let isAuthenticated: ReturnType<typeof signal<boolean>>;

  const run = (): boolean | UrlTree =>
    TestBed.runInInjectionContext(() => {
      const result = authenticatedGuard(route, state);
      if (typeof result === 'boolean' || result instanceof UrlTree) {
        return result;
      }

      throw new Error('Guard returned an unexpected async value');
    });

  beforeEach(() => {
    isAuthenticated = signal(false);

    TestBed.configureTestingModule({
      providers: [provideRoutingTesting(), { provide: AuthenticationService, useValue: { isAuthenticated: isAuthenticated as Signal<boolean> } }]
    });
  });

  it('should allow activation when the user is authenticated', () => {
    isAuthenticated.set(true);

    expect(run()).toBe(true);
  });

  it('should redirect to /login when the user is not authenticated', () => {
    isAuthenticated.set(false);

    const result = run();
    const router = TestBed.inject(Router);

    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
