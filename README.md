# popcorn-index

## Environment variables

The backend proxies TMDB calls and requires an API key exposed as an environment variable.

- `TMDB_API_KEY` — your TMDB v3 API key (get one at https://www.themoviedb.org/settings/api).

### How to set it (Windows)

Via PowerShell (persistent, User scope) :
```
setx TMDB_API_KEY "your_api_key_here"
```

Or via `Paramètres Windows > Système > Informations système > Paramètres système avancés > Variables d'environnement`.

> Close and reopen your terminal / IDE after setting the variable — running processes keep a frozen copy of the environment.

## Database

### Infos

Database : popcorn
User : popcorn
Password : popcorn
Port : 5432

### Startup

Start database : docker compose -f ./database/docker-compose.yml up -d
Stop database : docker compose -f ./database/docker-compose.yml down -v

### Migrations

To apply a migration, go to database folder, and run './add-migration.bat <migration_name>'
Example : './add-migration.bat add_users'

If an error occurs about the state of the database, you can reset it by running './update-database.bat 0'

You can remove the last migration by running './remove-last-migration.bat'
