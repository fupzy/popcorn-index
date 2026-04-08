@echo off

SET BASEDIR=%~dp0
CALL %BASEDIR%/init-env.bat
dotnet dotnet-ef database update %1 -p %MIGRATION_PROJECT% -s %MAIN_PROJECT% --context MigrationDbContext