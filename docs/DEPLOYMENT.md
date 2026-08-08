# Deployment

## Environment

`.env` (gitignored, copy from `.env.example`):

| Var | Required | Notes |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | App throws at import time if missing |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Anon key — safe to expose, see [SECURITY.md](SECURITY.md) |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Crash reporting stays a console-only no-op without it |

## Native builds (EAS)

```bash
eas build --profile development|preview|production --platform android|ios
```

Three profiles in `eas.json`:

| Profile | Purpose |
|---|---|
| `development` | Dev client, internal distribution, Android APK, iOS simulator build |
| `preview` | Internal distribution, Android APK |
| `production` | `autoIncrement: true` (build number bumps automatically) |

`preview` and `production` both set `SENTRY_DISABLE_AUTO_UPLOAD=true` — no
`SENTRY_AUTH_TOKEN` is configured yet, so the Sentry Gradle plugin's sourcemap-upload step would
otherwise fail the build. **Crash reporting still works without it; only readable (non-minified)
stack traces in the Sentry dashboard require setting up the token later.**

## Database migrations

**There is no automated migration deployment.** Every migration to date
(`supabase/migrations/0001` through `0004`) has been applied by hand: paste the `.sql` file's
contents into the Supabase Dashboard's SQL Editor, targeting the `main` / production project, and
run it. There is no staging environment and no CI step that applies migrations.

This has a real consequence worth knowing before you next touch the schema: **the Supabase CLI's
migration-history tracking has never been used for this project.** If you ever run
`supabase link` + `supabase db push`, the CLI will not know any of `0001`–`0004` were already
applied (it tracks that in its own `supabase_migrations` schema table, which manual dashboard
pastes never touch) and will try to reapply them. Every migration to date uses
`create or replace function` / `create table if not exists`-safe patterns where practical, so a
reapply is likely harmless, but verify before trusting `db push` blindly — or run
`supabase migration repair --status applied <version>` for each one first to sync the CLI's
bookkeeping with reality.

**Before writing a new migration**, read [DATABASE.md](DATABASE.md#known-drift-migration-history-vs-production)
first — the achievement catalog is a documented case where this repo's migration history and
actual production state already diverged once.

## Web

```bash
npx expo export --platform web --output-dir <dir>
```

Web output mode is `"single"` (SPA). SEO/meta-tag changes must be verified against a real export,
not the dev server — the dev server doesn't apply `public/index.html`'s template the same way a
build does. There is no committed web hosting/deploy pipeline (no Vercel/Netlify config, no
`gh-pages` workflow) — web export exists for local verification and preview, not as a shipped
deployment target today.

## Observability

Sentry (`@sentry/react-native`) is wired but inert without `EXPO_PUBLIC_SENTRY_DSN` set — see
`lib/crash-reporter.ts`. Once a DSN is configured, every caught error across the app (data-fetch
failures via `useAsync`, gamification RPC failures, account-deletion failures, React render
errors via `ErrorBoundary`) already routes through `reportError()`, so enabling the DSN is the
only step needed to start receiving crash reports — no additional call sites need wiring.

There is no product analytics (no PostHog/Amplitude/Firebase Analytics) and no performance
monitoring beyond Sentry's default crash capture.

## App store submission

`docs/STORE-LISTING.md` and `docs/PRIVACY-POLICY.md` hold draft listing copy and the privacy
policy text. `screenshots/` holds the numbered store-listing screenshot set (`01`–`10`). As of
this writing, submission itself (App Store Connect / Google Play Console setup, `eas submit`) has
not happened — `eas.json`'s `submit.production` block is present but empty (no configured
credentials/track).

## Release checklist

Not yet formalized as an automated release process. Until it is, treat a release as:

1. `npm run typecheck && npm run lint && npm test -- --ci` clean.
2. Any new/changed migration applied to production via the SQL Editor (see above), and manually
   verified against a real account before trusting it — see the verification pattern used for
   `0004_gamification_fix.sql` in git history for what "verified" means in practice (a live
   walkthrough of every affected flow, not just a syntax check).
3. `eas build --profile production --platform ios` and `--platform android`.
4. `eas submit` once submission credentials exist (not yet configured).
