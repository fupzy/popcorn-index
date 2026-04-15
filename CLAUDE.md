# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- Backend: .NET 10, ASP.NET Core (`net10.0`), EF Core 10 + Npgsql, FluentValidation, JWT, Swagger, Asp.Versioning, Scrutor (assembly scanning).
- Frontend: Angular 21 (`ui/`), Angular Material, Tailwind 4, Vitest (browser + Chromium) for unit tests, ESLint + Prettier.
- Tests: Reqnroll (SpecFlow fork) + xUnit + AwesomeAssertions, via a `TestServer` host harness.
- Database: PostgreSQL (docker-compose in `database/`), schema `popcorn_index`, snake_case naming convention.

## Common commands

Backend (run from repo root):
- Build: `dotnet build PopcornIndex.slnx`
- Run the API: `dotnet run --project src/PopcornIndex` (requires a running database and `.env` — see below)
- Run all specs: `dotnet test PopcornIndex.slnx`
- Run one spec project: `dotnet test specs/Users.Specs`
- Run a single scenario: `dotnet test specs/Users.Specs --filter "FullyQualifiedName~GettingAllUsers"`

Database (run from `database/` on Windows, these are `.bat` scripts):
- Start / stop PG: `docker compose -f ./database/docker-compose.yml up -d` / `down -v`
- Add migration: `./add-migration.bat <name>` (targets `MigrationDbContext` in `PostgreSqlMigration`, startup project is `src/PopcornIndex`)
- Apply migrations: `./update-database.bat` (or `./update-database.bat 0` to reset)
- Remove last migration: `./remove-last-migration.bat`

Frontend (run from `ui/`):
- Dev server: `npm start` (port 4200). Use `npm run start:local` to proxy `/popcorn-index` to `http://localhost:5000` via `local.proxy.conf.json`.
- Build: `npm run build` · Tests (watch): `npm test` · CI tests: `npm run test:ci` · Lint: `npm run lint`

## Architecture

### Solution layout (`PopcornIndex.slnx`)

- `src/PopcornIndex` — **host project**. `Program.cs` is a single line: `await AppService.RunApplication(args)`. It references every sibling `src/**/*.csproj` via a glob plus `database/PostgreSqlMigration`. Adding a new feature project requires no change here.
- `src/Authentication`, `src/Users`, `src/MockFeature` — feature/bounded-context projects, each split into `Domain/`, `Application/`, `Infrastructure/`, `Controllers/`.
- `src/Utilities` — shared bootstrap (`AppService`, `Helpers`, `DatabaseMigrator<T>`, extensions, core interfaces).
- `database/PostgreSqlMigration` — separate project owning `MigrationDbContext` and EF migrations. `MigrationDbContext` composes schema from each feature's DbContext (e.g. `UsersDbContext.CreateNewTables`) — **when you add a new DbContext, wire its `CreateNewTables` call into `MigrationDbContext.OnModelCreating`**.
- `testing/TestingUtilities` — generic test harness (`AppTestingService`, per-scenario DB, Reqnroll hooks).
- `testing/PopcornIndex.Testing` — app-specific test mocks/steps (`MockJwtService`, `MockPasswordHasher`, `UsersSteps` for `Given/Then` table data).
- `specs/<Feature>.Specs` — Reqnroll feature files + step definitions, one project per bounded context. A `.Specs` project must `ProjectReference` the feature's `src` project, otherwise its controllers are not discovered (see the comment in `Authentication.Specs.csproj:15`).

### Auto-registration pattern (important)

`AppService.Init` ([src/Utilities/AppService.cs](src/Utilities/AppService.cs)) does not hand-wire services. Instead, it scans assemblies via Scrutor:

- Any class implementing **`IServicesRegistrator`** is instantiated and its `Add(services, configuration)` is called. Each feature/layer registers its own services in a `ServicesRegistrator.cs` (see `src/Users/Domain/ServicesRegistrator.cs`, `src/Users/Infrastructure/ServicesRegistrator.cs`, `src/Authentication/Domain/ServicesRegistrator.cs`, etc.).
- Any class implementing **`IBeforeRun`** is registered scoped and executed after `Build()` but before `RunAsync()`. Used by `DatabaseMigrator<MigrationDbContext>` to apply migrations when `MIGRATE_DATABASE=true`.
- Controllers are discovered via `MvcBuilderExtensions.AddParts`, which scans all referenced assemblies for types assignable to `ControllerBase` and adds each assembly as an `ApplicationPart`.

Consequence: to add a new feature, create a new `.csproj` under `src/`, add a `ServicesRegistrator : IServicesRegistrator` per layer, and controllers under `Controllers/`. `PopcornIndex.csproj`'s glob + assembly scanning picks them up automatically — no central wiring changes needed.

Test-time DI uses a parallel interface **`ITestingServicesRegistrator`** ([testing/TestingUtilities/ITestingServicesRegistrator.cs](testing/TestingUtilities/ITestingServicesRegistrator.cs)) so mocks only load under `AppTestingService`, not in production.

### API conventions

Controllers use `[ApiVersion(1.0)]` + `[Route("api/v{version:apiVersion}/<name>")]` and `[ApiExplorerSettings(GroupName = "v1")]`. Swagger is mounted by `AppService.Configure`. CORS policy `enableAll` allows everything (development-only default).

Validation: commands (e.g. `LoginOrRegisterCommand`) have a `FluentValidation` validator registered in the feature's `Controllers/ServicesRegistrator.cs`. Controllers call `validator.ValidateAsync`, then `validationResult.AddToModelState(ModelState)` + `return ValidationProblem(ModelState)` on failure — see `AuthenticationController` for the pattern.

### Configuration & environment

- Shared `appsettings/appsettings.json` is resolved via the `APPSETTINGS_FOLDER` env var (set by MSBuild `appsettings.props` → `launchSettings.json`). If the env var is unset/invalid, the current directory is used. See `Helpers.GetConfigFilesFolder`.
- `.env` file is loaded at startup by `Helpers.ReadEnvFileIfExists` (path from `ENV_FILE` env var, default `.env`). Values may reference other env vars with `%VAR%`.
- DB connection string in config is a template `server=%POSTGRES_HOST%;port=%POSTGRES_PORT%;...`. Runtime substitution happens in `ConfigurationExtensions.GetUpdatedConnectionString` — **never use `configuration.GetConnectionString("postgresql")` directly**, always `configuration.GetUpdatedConnectionString()`.
- Default PG schema is read via `configuration.GetPostgreSqlSchema()` (falls back to `public`). All DbContexts call `modelBuilder.HasDefaultSchema(configuration.GetPostgreSqlSchema())` + `.UseSnakeCaseNamingConvention()`.
- NuGet versions are centrally managed in `Directory.Packages.props` (`ManagePackageVersionsCentrally=true`). Per-project `.csproj` files declare `<PackageReference Include="..."/>` without version. `Directory.Build.props` at `src/`, `testing/`, `specs/`, `database/` levels adds package references that apply to all projects under that folder.
- `src/Directory.Build.props` grants `InternalsVisibleTo` to `PostgreSqlMigration`, `<Feature>.Specs`, `TestingUtilities`, `PopcornIndex.Testing` — feature internals are visible to migrations and tests.

### Test harness

- `AppTestingService` ([testing/TestingUtilities/AppTestingService.cs](testing/TestingUtilities/AppTestingService.cs)) builds the real `AppService`, swaps in `WebHost.UseTestServer`, and additionally runs `ITestingServicesRegistrator` implementations to install mocks.
- Scenarios are tagged to opt into harness behaviors:
  - `@integration` → `ServiceTestingSteps` boots the test server before the scenario.
  - `@postgresql` → `TestingDatabaseCreator` creates a **brand-new PostgreSQL database** named `popcorn_index_<guid>` before each scenario and drops it after. The connection string is injected as a CLI arg `--ConnectionStrings:Postgresql=...`.
  - `@arg:key=value` tags are translated to `--key=value` CLI args (scenario overrides feature). See `ServiceTestingSteps.SetupCommandLineArguments`.
- Steps use constructor injection of `ApiTesting`, `ServiceTestingSteps`, `AppTestingService` — Reqnroll resolves them from the `stepAssemblies` listed in `specs/reqnroll.json` (`TestingUtilities`, `PopcornIndex.Testing`).
- Scenarios tagged `@postgresql` are marked non-parallelizable (`specs/reqnroll.json`).
- `*.feature.cs` files are generated and gitignored — do not edit them.
