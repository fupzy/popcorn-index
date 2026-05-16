import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthenticationService } from './authentication.service';

export const authenticatedGuard: CanActivateFn = (): true | UrlTree => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (authenticationService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
