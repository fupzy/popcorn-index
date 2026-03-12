SET BASEDIR=%~dp0

SET MIGRATION_PROJECT=%BASEDIR%\\PostgreSqlMigration\\PostgreSqlMigration.csproj
SET MAIN_PROJECT=%BASEDIR%\\..\\src\\PopcornIndex\\PopcornIndex.csproj

SET POSTGRES_HOST=localhost
SET POSTGRES_DB=popcorn
SET POSTGRES_USER=popcorn
SET POSTGRES_PASSWORD=popcorn
SET POSTGRES_PORT=5432