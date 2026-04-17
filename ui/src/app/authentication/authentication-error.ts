import { HttpErrorResponse } from '@angular/common/http';

const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please try again later.';
const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

/**
 * Returns the network-hint message when the response never reached a
 * server (status 0), otherwise a generic fallback. Callers should first
 * handle their own status-specific cases and delegate here as a default.
 */
export const networkOrGenericErrorMessage = (error: HttpErrorResponse): string => {
  return error.status === 0 ? NETWORK_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;
};
