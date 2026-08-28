# Sawary API (PHP / MySQL)

Plain PHP 8 + PDO REST API, no framework, no Composer dependencies. It is a
drop-in replacement for the old ASP.NET Core (`SawaryAPI/`) backend: same
routes, same JSON shapes, same status codes — the Next.js frontend
(`sawaryfrontend/`) needs **no code changes**, only an updated
`NEXT_PUBLIC_API_URL`.

## Requirements

- PHP 8.0+ with `pdo_mysql` extension enabled
- MySQL 5.7+ / MariaDB 10.3+
- Apache with `mod_rewrite` (for `.htaccess`)

## Deployment (shared hosting / cPanel)

1. **Create the database.** In cPanel → MySQL Databases, create a database
   and a user with full privileges on it. Note the host, database name,
   username and password.

2. **Import the schema.** Open phpMyAdmin, select your new database, go to
   the "Import" tab and import `schema.sql`. This creates the four tables
   (`admin_users`, `categories`, `projects`, `project_images`) and seeds a
   default admin user.

3. **Upload the files.** Upload the entire contents of `SawaryAPI-PHP/` to
   the document root of the (sub)domain that will serve the API, e.g.
   `api.yourdomain.com` → `public_html/api/` (or the subdomain's own root).

4. **Configure.** Copy `config.example.php` to `config.php` and fill in:
   - `db.host` / `db.name` / `db.user` / `db.pass` — from step 1
   - `jwt.key` — replace with a new long random secret (e.g. 32+ random
     characters)
   - `allowed_origins` — your frontend's real domain(s), e.g.
     `https://sawary.com`, plus `http://localhost:3000` if you still test
     locally

   `config.php` is gitignored and must never be committed — it contains
   secrets.

5. **Make `uploads/` writable.** Set permissions so PHP can write to the
   `uploads/` directory (e.g. `755` or `775` depending on your host's
   user/group setup).

6. **Point the frontend at the new API.** In the Next.js deployment
   environment, set:

   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

7. **Log in.** The seeded admin account is:

   - username: `admin`
   - password: `Sawary@2026`

   To change the password later, generate a new bcrypt hash (e.g. via PHP's
   `password_hash('your-new-password', PASSWORD_BCRYPT)`) and update the
   `password_hash` column of the `admin_users` row via phpMyAdmin.

## Local development / testing

The router (`index.php`) handles all paths itself, so it works with PHP's
built-in server using the router-script form:

```bash
php -S localhost:8080 index.php
```

Then, with a local MySQL database configured in `config.php`:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Sawary@2026"}'
```

Use the returned `token` as a `Authorization: Bearer <token>` header for the
authenticated endpoints (creating categories/projects, uploading images,
etc.).

To test against the real frontend, set `NEXT_PUBLIC_API_URL=http://localhost:8080`
in `sawaryfrontend`, then run the admin dashboard and the public `/works/*`
pages and confirm everything renders the same as with the .NET backend.

## Out of scope

- **Data migration.** This is a fresh install — it ships with just the
  seeded admin user and empty `categories`/`projects` tables. Migrating
  existing data from the SQL Server database used by `SawaryAPI/` to MySQL
  is a separate task; ask if you need it.
- **The .NET project.** `SawaryAPI/` is untouched and still works if you
  have somewhere to run it — this PHP API is an additive alternative for
  hosts without a VPS.
