# Phase 2 — Supabase

Phase 1 does not call Supabase. The discovery form and the open-enrollment interest form are complete in the browser and stop before any network request. This note is the integration path so those forms do not need to be redesigned.

## Flow

```text
Browser form
  → Supabase Edge Function
  → server-side validation and anti-spam
  → Postgres insert
  → email notification
  → Prestige inbox
```

Do not put an email-provider API key or the Supabase service-role key in browser JavaScript.

The public anon key may be used in the frontend only with correct row-level security. Inquiry writes should still go through an Edge Function so validation, spam controls, and email happen on the server.

## Forms already in the markup

Discovery form: inline at `contact.html#discovery-form`, with a sitewide dialog `#discovery-dialog` (`data-modal="discovery"`). Both use the same field generator. Field IDs are prefixed with `page-discovery-` or `dialog-discovery-`; field names remain unchanged. `source_page` is set to the page that opened it.

Field names:

- `name`
- `company`
- `title`
- `email`
- `phone`
- `industry`
- `employee_count`
- `city_state`
- `training_interest`
- `desired_timing`
- `service_challenge`
- `consent`
- `source_page`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `company_website` (honeypot, must stay empty)

Interest form: inline at `open-enrollment.html#interest-form`, with a sitewide dialog `#enrollment-dialog` (`data-modal="enrollment"`). Field IDs are prefixed with `page-enrollment-` or `dialog-enrollment-`. `source_page` is set to the page that opened it.

Field names:

- `name`
- `email`
- `phone`
- `city_state`
- `employer_role`
- `program_interest`
- `preferred_timeframe`
- `consent`
- `source_page`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `company_website` (honeypot)

Phase 1 submit handlers call `preventDefault()`, validate in the browser, and show a notice that the inquiry was **not** sent. Replace that behavior only when the Edge Function returns a real result. Do not show a success state for a request that did not leave the browser.

Submission buttons are initially disabled and enabled only after the no-network validation handler is attached. Preserve that initialization order when connecting the service. Both inline and dialog forms use `[data-phase1-form]` and `data-form-kind="discovery"` or `"enrollment"`. Replace the shared submit handler once, rather than adding separate network logic for each presentation.

Public `training_interest`, `program_interest`, and `industry` query parameters may prefill matching select options. Unknown values are ignored. Contextual inquiry links carry only these public choices; personal data is never stored in URLs or browser storage. Input field names, consent, honeypot, source page, and UTM names remain the integration contract.

When Phase 2 is enabled, replace the always-visible disconnected notice, retain user input after failures, announce server validation errors accessibly, and display confirmation only after an actual successful response. Keep email and telephone alternatives available.

## Table: `contact_inquiries`

No public read access.

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`
- `name text not null`
- `company text not null`
- `title text null`
- `email text not null`
- `phone text not null`
- `industry text not null`
- `employee_count text not null`
- `city_state text not null`
- `training_interest text not null`
- `desired_timing text not null`
- `service_challenge text null`
- `consent boolean not null`
- `source_page text null`
- `utm_source text null`
- `utm_medium text null`
- `utm_campaign text null`
- `status text default 'new'`

Allow-list `industry` and `training_interest` to the option values in the form.

## Table: `open_enrollment_interests`

No public read or anonymous write.

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`
- `name text not null`
- `email text not null`
- `phone text not null`
- `city_state text not null`
- `employer_role text null`
- `program_interest text not null`
- `preferred_timeframe text not null`
- `consent boolean not null`
- `status text default 'new'`

## Table: `open_enrollment_sessions`

Published dates only. The open-enrollment page already has a region, `#sessions`, and a container, `[data-session-list]`, where confirmed session cards can replace the interest-list explanation.

- `id uuid primary key`
- `program_slug text`
- `title text`
- `start_date date`
- `end_date date`
- `location_name text`
- `city_state text`
- `price numeric`
- `capacity integer`
- `registration_status text`
- `published boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

Row-level security:

- anonymous users may read only rows where `published = true`
- no anonymous write access
- sessions are managed in the Supabase Dashboard at first
- do not build an admin portal unless it is requested separately

Do not invent dates in the interface. If no published rows exist, keep the current interest-list state.

## Email

Use an Edge Function and a transactional provider chosen later (Resend, Postmark, or SendGrid).

1. Validate the payload.
2. Reject a filled honeypot.
3. Normalize fields and enforce length limits.
4. Insert the database row.
5. Email `nwimbley@prestigesignaturestandard.com` with a structured summary.
6. Optionally send a neutral acknowledgement to the submitter.
7. Return a non-sensitive success response.

## Spam controls

- honeypot (`company_website`)
- rate limiting where feasible
- Cloudflare Turnstile or an equivalent check if needed
- server-side length limits
- strict allow-lists for select values

## Environment variables

Never hardcode secrets.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (frontend only with RLS, or omitted if all writes go through the Edge Function)
- service-role key only inside the Edge Function environment
- email provider secret only inside the Edge Function environment
- anti-spam secret only on the server

## Credential verification

A future credential registry will use unique credential numbers. Do not implement public lookup in Phase 2 unless it is separately authorized. When it is built later, expose only the minimum verification result and never a full credential database.
