# Code Review

## Security / Authentication

- [x] Protect endpoints with authorization. — `fix: 8d2815ed34fa7113c6c181608b68488925290320`
- [x] Do not expose password hashes and user ids. — `fix: 9cfc3eb624be39d0a1161976ddb4d1411d3d1605`
- [ ] Use cookies instead of `localStorage`. — `fix: `
- [ ] Do not log sensitive data. — `fix: `
- [x] Remove `Jwt:Key` from the appsettings. — `fix: a85437417193c29b783cf25b75c2b817840e1b29`
- [ ] Remove the enableAll CORS Policy, accept request from the server only. — `fix: `

## Business rules

- [x] Prevent users from reviewing an empty season. — `fix: 10614f107f10b65050dba0a3a20d9a72de6574fe`

## Frontend (Angular)

- [ ] Handle all errors on the Angular part. — `fix: `
- [x] Fall back to the client language when language retrieval fails. — `fix: 20b7def37e2aeb93cdf40390b1ced18d6bc82cc8`
- [x] The empty search state message should differ depending on whether the user has typed in the search bar. — `fix: 7798cbd624434fa0d23b82f8f28d9d8c1217677a`
- [ ] Show a message saying that the stars rating is required — `fix: `
