# 🍿 Popcorn Index

> Discover movies and TV shows, then keep your own rated, commented review journal.

**Live app: https://popcornindex.socoolmen.me**

Popcorn Index is a movie & TV discovery and review application. It uses [TMDB](https://www.themoviedb.org/)
as its catalog source and layers a personal review system on top: search the catalog, open a title,
rate it from 0 to 10, leave a comment — and for series, rate each season individually. Every review you
write is kept in your own journal so you can revisit and update it later.

The TMDB API key never reaches the browser: the backend acts as a thin proxy that injects the key
server-side, so credentials stay on the server.

## Features

- **Discovery home** — a random movie or series suggestion to get you started, with a one-click reshuffle.
- **Search** — search movies, series, or both at once (TMDB multi-search), with a language filter.
- **Media details** — dedicated movie and series pages; series pages break down into per-season detail.
- **Reviews** — create and edit reviews with a 0–10 star rating and an optional comment.
  - Movies get a single rating.
  - Series additionally support **per-season ratings**, each with its own optional comment.
- **My reviews** — an authenticated journal of every review you have written, available to edit.
- **Authentication** — register / log in with JWT; the session auto-expires when the token does.

## Tech stack

| Layer        | Technology                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Backend**  | .NET 10, ASP.NET Core (`net10.0`), EF Core 10 + Npgsql, FluentValidation, JWT, Swagger, Scrutor      |
| **Frontend** | Angular 21, Angular Material, Tailwind 4 (standalone components, signals)                            |
| **Database** | PostgreSQL (schema `popcorn_index`, snake_case naming)                                               |
| **Tests**    | Reqnroll (BDD) + xUnit + AwesomeAssertions (backend); Vitest + Chromium (frontend)                   |
| **Deploy**   | Docker Compose (4 services behind an nginx reverse proxy) — see [deploy/README.md](deploy/README.md) |

## Architecture

### Backend — feature modules with a layered folder structure

The solution (`PopcornIndex.slnx`) is organized as one **feature project per domain** under `src/`.
Each feature is a single `.csproj` whose code is split into four folders by responsibility:

- **`Domain/`** — plain C# entities (e.g. `Review`, with no EF or framework dependencies), command
  objects, enums, and the interfaces other layers depend on (`IReviewRepository`, `IAuthService`,
  `IJwtService`).
- **`Application/`** — the service implementations behind those interfaces (`AuthService`,
  `JwtService`). Not every feature has one: `Reviews` has no `Application/` folder — its controller
  uses the repository directly.
- **`Infrastructure/`** — the EF Core layer: the `DbContext`, repository implementations, and
  **DAO classes that are kept separate from the domain entities**, with an explicit `ToEntity()`
  mapping (e.g. `ReviewDao.ToEntity()`), so the database shape does not leak into `Domain`.
- **`Controllers/`** — the ASP.NET controllers and their FluentValidation validators.

Controllers and services depend on the `Domain` interfaces rather than the concrete EF classes; each
layer ships a `ServicesRegistrator` that binds an interface to its implementation
(`AddScoped<IReviewRepository, ReviewRepository>()`), and these are discovered and run at startup by
Scrutor assembly scanning (see below). Note this is a folder/namespace convention within a single
assembly per feature — it is **not** enforced by separate projects, so the layering relies on
discipline (for instance, `Reviews.Domain.ServicesRegistrator` does reference `Reviews.Infrastructure`).

The feature modules are:

- **`src/Authentication`** — register / login, JWT issuance.
- **`src/Users`** — user accounts.
- **`src/Reviews`** — movie & series reviews, including per-season ratings.
- **`src/TMDB`** — a transparent proxy controller that forwards GET requests to TMDB v3, appending
  `TMDB_API_KEY` server-side.
- **`src/Utilities`** — shared bootstrap (`AppService`), helpers, extensions, and the core
  registration interfaces.

Two patterns keep the codebase modular and wiring-free:

- **`src/PopcornIndex`** is the host project. `Program.cs` is a single line —
  `await AppService.RunApplication(args)` — and the `.csproj` globs every sibling `src/**/*.csproj`.
  Adding a feature requires **no change** here.
- **Auto-registration via Scrutor**: any class implementing `IServicesRegistrator` has its
  `Add(services, configuration)` called at startup, and any `IBeforeRun` runs after `Build()` but
  before the server starts (used by the database migrator). Controllers are discovered by scanning
  referenced assemblies. So a new feature = a new `.csproj` + per-layer `ServicesRegistrator` classes,
  with no central wiring to touch.

Migrations live in their own project, **`database/PostgreSqlMigration`**, which owns
`MigrationDbContext` — composed from each feature's DbContext (e.g. `UsersDbContext.CreateNewTables`).

### Frontend — Angular 21, standalone & signal-driven

The UI (`ui/`) is built from standalone components organized by feature folder
(`home/`, `search/`, `media-detail/`, `reviews/`, `my-reviews/`, `authentication/`), with routes
lazy-loaded per feature ([ui/src/app/app.routes.ts](ui/src/app/app.routes.ts)). State is managed with
signals and `computed()`, change detection is `OnPush`, and authenticated routes are protected by a
route guard. Shared building blocks are exported through a `@shared` barrel.

The frontend never talks to TMDB directly — all catalog and review calls go through the backend at
`/popcorn-index/api/v1/*`.

## Testing

### Backend — BDD acceptance & integration tests (Reqnroll + xUnit)

Backend behavior is covered by **acceptance / integration tests** written in **Gherkin** (BDD), one
`.Specs` project per feature module (`specs/Authentication.Specs`, `specs/Users.Specs`,
`specs/Reviews.Specs`, `specs/TMDB.Specs`). They are **black-box, end-to-end at the HTTP boundary**:
each scenario fires real HTTP requests at an in-process `TestServer` (via `AppTestingService`) and
asserts on the responses and the resulting database state — there is no mocking of the layers under
test. Scenarios read as `Given / When / Then`, often driven by data tables:

```gherkin
Scenario: Creating a movie review persists it
    Given the defined users
        | Id                                   | Username | PasswordHash |
        | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | Alice    | hash         |
    When I create a review with the command
        """
        { "userId": "aaaaaaaa-...", "mediaType": "Movie", "tmdbId": 550, "rating": 8 }
        """
    Then I receive a "OK" status
```

Scenarios opt into harness behaviors via **tags**:

- `@integration` — boots the test server before the scenario.
- `@postgresql` — provisions a brand-new throwaway PostgreSQL database (`popcorn_index_<guid>`)
  per scenario and drops it afterwards.
- `@arg:key=value` — passes `--key=value` as a CLI argument.

Production services that are awkward in tests (JWT signing, password hashing, GUID generation, the
outbound TMDB call) are swapped for mocks through a parallel `ITestingServicesRegistrator` interface,
so mocks load only under the test harness and never in production.

Run the specs:

```bash
dotnet test PopcornIndex.slnx                 # all specs
dotnet test specs/Reviews.Specs               # one feature module
dotnet test specs/Users.Specs --filter "FullyQualifiedName~GettingAllUsers"  # one scenario
```

### Frontend — component & unit tests (Vitest)

The UI is covered by **component and unit tests** running under **Vitest in a real Chromium browser**
(no headless DOM emulation). Tests render components in isolation, mock their collaborators, drive
Angular Material elements through **CDK component harnesses**, use `HttpTestingController` to assert
HTTP interactions, and verify signal-driven state. There is no separate end-to-end (browser
automation) suite — end-to-end coverage of the API contract lives in the backend specs above.

```bash
cd ui
npm test           # watch mode
npm run test:ci    # single run with coverage
npm run lint
```

## Getting started

### 1. Environment variables

The backend requires two secrets, provided as environment variables:

- `TMDB_API_KEY` — your TMDB v3 API key (get one at https://www.themoviedb.org/settings/api).
- `JWT_KEY` — the JWT signing key, at least 32 bytes (e.g. `openssl rand -base64 64`).

#### How to set them (Windows)

Via PowerShell (persistent, User scope):

```powershell
setx TMDB_API_KEY "your_api_key_here"
setx JWT_KEY "your_jwt_signing_key_here"
```

Or via `Paramètres Windows > Système > Informations système > Paramètres système avancés > Variables d'environnement`.

> Close and reopen your terminal / IDE after setting the variable — running processes keep a frozen
> copy of the environment.

### 2. Database

Connection defaults: database `popcorn`, user `popcorn`, password `popcorn`, port `5432`.

```bash
# Start / stop PostgreSQL (run from the repo root)
docker compose -f ./database/docker-compose.yml up -d
docker compose -f ./database/docker-compose.yml down -v
```

Migrations (run from the `database/` folder, Windows `.bat` scripts):

```bat
add-migration.bat add_users        :: add a migration
update-database.bat                :: apply migrations
update-database.bat 0              :: reset the database
remove-last-migration.bat          :: remove the last migration
```

### 3. Run the backend

```bash
dotnet build PopcornIndex.slnx
dotnet run --project src/PopcornIndex     # requires a running database and a .env file
```

### 4. Run the frontend

```bash
cd ui
npm install
npm start                # http://localhost:4200
npm run start:local      # proxies /popcorn-index to http://localhost:5000
```

## Deployment

The app ships as a 4-service Docker stack (`db`, `api`, `ui`, `proxy`) behind a host nginx reverse
proxy that terminates TLS. See **[deploy/README.md](deploy/README.md)** for the full guide.
