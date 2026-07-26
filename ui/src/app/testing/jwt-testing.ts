/**
 * Claims embedded in a test JWT. Both are optional so specs can build the
 * degenerate tokens the authentication service is expected to reject.
 */
export interface UnsignedJwtClaims {
  readonly sub?: string;
  readonly exp?: number;
}

/**
 * User id carried by test tokens that do not care about a specific subject.
 */
export const TEST_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

/**
 * Builds a syntactically valid — but unsigned — JWT carrying the given claims.
 * The signature segment is a placeholder: only the backend verifies signatures.
 */
export const unsignedJwtWithClaims = (claims: UnsignedJwtClaims): string => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));

  return `${header}.${payload}.signature`;
};

/**
 * Builds an unsigned JWT whose `exp` claim is `seconds` away from the current clock —
 * positive for a token still valid, negative for an already expired one.
 */
export const unsignedJwtExpiringIn = (seconds: number): string =>
  unsignedJwtWithClaims({ sub: TEST_USER_ID, exp: Math.floor(Date.now() / 1000) + seconds });
