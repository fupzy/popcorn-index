import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthenticationService } from './authentication.service';

const API_URL_PREFIX = '/popcorn-index/';

/**
 * Attaches the stored JWT as a bearer token so the backend can authenticate the
 * caller and derive its identity from the `sub` claim.
 */
export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthenticationService).getToken();

  if (token === null || !request.url.startsWith(API_URL_PREFIX)) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
