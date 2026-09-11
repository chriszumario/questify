# Questify

Questify is a multilingual SaaS application for creating quizzes and polls, generating content with AI, reviewing analytics, and selling a Pro subscription through Polar.

This guide explains how to install Questify locally, configure its services, prepare the database, create the first administrator, and deploy the application.

## Technology stack

- Next.js 16 and React 19
- TypeScript
- Better Auth with email/password and optional Google OAuth
- Drizzle ORM with Turso/libSQL
- Google Gemini or OpenAI for AI generation
- Polar for subscription payments
- next-intl with English and Spanish support

## Requirements

Install the following software before continuing:

- [Node.js](https://nodejs.org/) 20.9 or newer
- [pnpm](https://pnpm.io/installation)
- A [Turso](https://turso.tech/) database
- Git, if you are cloning the project from a repository

The following accounts are optional and only required for their corresponding features:

- [Google Cloud Console](https://console.cloud.google.com/) for Google sign-in
- [Google AI Studio](https://aistudio.google.com/) for Gemini
- [OpenAI](https://platform.openai.com/) for OpenAI models
- [Polar](https://polar.sh/) for Pro subscriptions

## 1. Install the project

Clone or extract the project, open a terminal in its root directory, and install the dependencies:

```bash
pnpm install
```

## 2. Configure environment variables

Create a local `.env` file from the included example.

macOS or Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure the values described below.

### Required variables

| Variable              | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`  | Secret used by Better Auth to protect authentication data. Generate one with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL`     | Application origin. Use `http://localhost:3000` locally.                                             |
| `TURSO_DATABASE_URL`  | The libSQL URL shown in the Turso database dashboard.                                                |
| `TURSO_AUTH_TOKEN`    | An authentication token for the Turso database.                                                      |
| `NEXT_PUBLIC_APP_URL` | Public application origin. Use `http://localhost:3000` locally.                                      |

Example:

```dotenv
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:3000

TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env`, access tokens, API keys, or webhook secrets to source control.

### Google sign-in (optional)

Create an OAuth 2.0 Web application in Google Cloud and add this local authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Then add the credentials to `.env`:

```dotenv
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

If these variables are omitted, email and password authentication remains available and the Google sign-in option is disabled.

### AI generation (optional)

Configure at least one provider if you want to use AI generation:

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

After creating an administrator, select the active provider and model from **Dashboard > Admin > Platform Settings > AI Configuration**.

### Polar subscriptions (optional)

Questify only requires one Polar environment variable:

```dotenv
POLAR_ACCESS_TOKEN=polar_oat_your_organization_access_token
```

Create an organization access token in the Polar dashboard. The token must belong to the same Polar environment selected in Questify.

After creating the administrator:

1. Open **Dashboard > Admin > Platform Settings > Payments**.
2. Select **Sandbox** while testing.
3. Configure the price, currency, billing interval, and Pro features.
4. Save the settings.

Questify creates or updates the Polar product, recurring price, and public webhook automatically through the Polar SDK. Product IDs and webhook secrets do not need to be added to `.env`.

## 3. Prepare the database

Create the tables in the Turso database from the current Drizzle schema:

```bash
pnpm db:push
```

Useful database commands:

| Command            | Purpose                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm db:generate` | Generate SQL migrations after a schema change.                        |
| `pnpm db:migrate`  | Apply generated migrations.                                           |
| `pnpm db:push`     | Synchronize the current schema directly with the configured database. |
| `pnpm db:studio`   | Open Drizzle Studio.                                                  |
| `pnpm db:check`    | Validate the migration files.                                         |

## 4. Start Questify

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Questify will route the application to one of its supported locales:

- English: `http://localhost:3000/en`
- Spanish: `http://localhost:3000/es`

## 5. Create the first administrator

The standard seed promotes the first registered user to administrator and activates the Pro plan for that account.

1. Start Questify and register a user with email/password or Google.
2. Keep the application running and open a second terminal.
3. Run:

```bash
pnpm db:seed
```

4. Refresh the application. The account will now have access to the admin panel.

Run this seed only after at least one user exists. It updates the first user returned by the database.

## Quality checks

Before deploying or submitting changes, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Production deployment

Questify can be deployed to Vercel or another Node.js hosting provider.

1. Create a production Turso database and apply the schema or migrations.
2. Add the environment variables from `.env` to the hosting provider. Use production secrets and URLs.
3. Set both `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the final HTTPS origin.
4. If Google sign-in is enabled, add this production redirect URI in Google Cloud:

   ```text
   https://your-domain.com/api/auth/callback/google
   ```

5. Deploy the application.
6. Register the first production user and run the seed against the production database if that account should become the administrator.
7. Open the payment settings, select **Production**, and save them with a production Polar organization token.

Saving payment settings from a public HTTPS deployment allows Questify to register this webhook automatically:

```text
https://your-domain.com/api/polar/webhooks
```

## Troubleshooting

### Environment changes are not applied

Restart the development server after editing `.env`.

### Google returns a redirect URI error

Verify that the Google OAuth redirect URI exactly matches the application origin and ends with `/api/auth/callback/google`.

### The admin panel is not visible

Register a user before running `pnpm db:seed`, then sign out and sign in again if the existing session still contains the previous role.

### Polar requests fail

Confirm that `POLAR_ACCESS_TOKEN` is an organization access token and that it belongs to the Sandbox or Production environment selected in the payment settings.

### The database command cannot connect

Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then confirm that the token has access to the selected Turso database.
