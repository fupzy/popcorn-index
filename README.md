# popcorn-index

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
