---
title: Privacy Policy
---

# Privacy Policy — Life Budget Simulator

**Last updated:** 2026-08-07

Life Budget Simulator ("the app") is a personal budgeting app. This policy explains what data
the app collects, how it's stored, and how you can remove it.

## What we collect

| Data | Why | Where it's stored |
|---|---|---|
| Email address, password | Account creation and sign-in | Supabase Auth (encrypted at rest) |
| Name, handle, income, budget, goal, and transaction data you enter | Powers the budgeting features you use — envelopes, the net-worth simulator, goals, achievements | Supabase Postgres, in a database row scoped to your account |
| Persona, currency, and app preference choices | Personalizes onboarding and display | Same as above |

We do not collect location, contacts, photos, device identifiers, or advertising IDs. The app
has no ads and no third-party analytics or trackers as of this version.

## How your data is protected

Every table holding your personal data (profile, transactions, budgets, goals, achievement
progress) uses Postgres Row Level Security: policies restrict all reads and writes to rows
matching your own authenticated user ID. No other user, and no unauthenticated request, can
read or write your data. Source: [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## Who processes your data

Supabase (supabase.com) hosts our authentication and database as our infrastructure provider.
We do not sell, rent, or share your data with advertisers or other third parties.

If crash reporting is added in a future version, this policy will be updated to name that
provider before it ships.

## Data retention and deletion

Your data is retained as long as your account exists. You can permanently delete your account
and all associated data at any time from **Profile → Delete account** in the app. This
immediately and irreversibly removes your profile, transactions, budgets, goals, and
achievement progress. You can also request deletion by emailing **brixdodd07@gmail.com**.

## Children's privacy

This app is not directed at children under 13, and we do not knowingly collect data from them.

## Changes to this policy

If this policy changes, the "Last updated" date above will change and material changes will be
noted in the app's release notes.

## Contact

Questions about this policy or your data: **brixdodd07@gmail.com**
