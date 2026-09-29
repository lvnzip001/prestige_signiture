# Admin inquiry notifications with FormSubmit

Website inquiries are stored in Supabase and sent only to the admin inbox through FormSubmit. The recipient defaults to `nwimbley@prestigesignaturestandard.com` and can be changed in admin.html → Email. Visitors receive an on-screen acknowledgement after durable storage. No customer email, autoresponse, or booking email is sent. Resend is not used, and no DNS records were changed.

Project: `nrehqharpjphuwvijket`. Delivery is **not enabled**. The current test recipient is `zluvuno@gmail.com`. FormSubmit activation is per address, so this does not activate `nwimbley@prestigesignaturestandard.com`.

## Deployed

- Migration `email` (`supabase/migrations/20260929010000_email.sql`) is applied. `email_settings.enabled` is false. `notification_to` is `nwimbley@prestigesignaturestandard.com`. Existing bookings, admin accounts, and the password reminder were left in place. The earlier `test_admin` migration was not reapplied.
- Public, anon, and authenticated have no table access except an authenticated academy admin, who can read settings and update only `notification_to`. Public roles cannot read inquiries or the notification queue. `accept_inquiry` and `claim_email` are executable by `service_role` only. The only public trigger remains `bookings_touch`.
- Edge Functions `inquiry` (version 1) and `email-worker` (version 1) are active with JWT verification off. Each function checks its own request. A request with no allowed origin returns 403. A worker request without the bearer secret returns 401.
- `pg_cron` is in `pg_catalog` and `pg_net` is in `extensions` (migration `email_extensions`). Vault is already installed. No cron job is scheduled yet, so there is no duplicate `prestige-email-dispatch` job.
- `vercel.json` already rewrites `/api/inquiry` to the inquiry function. `assets/js/booking-config.mjs` still has `inquiryEndpoint: null` and `turnstileSiteKey: null`, so the public form keeps the email-draft fallback until Turnstile is configured.
- Local checks passed: `node --test tests/email-unit.test.mjs` and `npx playwright test tests/email.spec.mjs`. Database checks covered admin-only reads, a rejected column update, duplicate request IDs, the hourly rate limit, and a claimed row while delivery was temporarily enabled inside a rolled-back transaction. No inquiry or outbox row remains. No message was sent to FormSubmit.

## FormSubmit compatibility

The worker posts JSON to `https://formsubmit.co/ajax/{recipient}` with `Content-Type` and `Accept` set to `application/json`. It also sends `Origin` and `Referer` for `https://prestigesignaturestandard.com`, because FormSubmit rejects a request that has no website referrer. The payload is `_subject` (`Prestige Academy — New discovery inquiry`), `_template: table`, the visitor name, the inquiry text, and the stored reference. It does not send `_captcha`, `_autoresponse`, `_cc`, or any address from the form. Success is accepted when `success` is boolean `true` or the string `"true"`. A response whose message says the form needs activation is recorded as activation required and is not retried. Any other non-JSON or unconfirmed response is marked failed and is not retried. Provider acceptance is not proof the inbox received the message.

On 29 September 2026 a setup check was posted to `zluvuno@gmail.com` with the Academy website as the referrer. FormSubmit returned `success: "false"` and the message that the form needs activation. That is the onboarding email, not the inquiry. A request without a website referrer was rejected and did not send onboarding. No inquiry or outbox row was created, and delivery remains off.

## Still required

1. In the Supabase dashboard for this project, set Edge Function secrets:
   - `EMAIL_WORKER_SECRET`: a long random value
   - `PUBLIC_SITE_ORIGINS`: `https://prestigesignaturestandard.com,https://www.prestigesignaturestandard.com`
   - `TURNSTILE_SECRET_KEY`: the secret from a Cloudflare Turnstile widget for those two hostnames
2. Create matching Vault secrets: `prestige_functions_url` = `https://nrehqharpjphuwvijket.supabase.co/functions/v1`, and `prestige_email_worker_secret` = the same value as `EMAIL_WORKER_SECRET`.
3. Run `supabase/email-schedule.sql` once. It replaces any existing job named `prestige-email-dispatch` before creating the one-minute schedule. Do not run it before both secrets exist; the worker will reject the call.
4. Create the Turnstile widget and send the public site key. Then set `turnstileSiteKey` and `inquiryEndpoint: '/api/inquiry'` in `assets/js/booking-config.mjs`, rebuild the pages, and publish the site. Until that publish, production still uses the email-draft form.
5. The FormSubmit activation email for `zluvuno@gmail.com` has been sent. Open that inbox, including spam, and use FormSubmit’s Activate Form link. After that activation, one more controlled inquiry can confirm the subject `Prestige Academy — New discovery inquiry`. Do not send it before the link is used. Changing the recipient later requires a new activation for that new address.

The privacy page still says an inquiry only creates an email draft the visitor chooses to open. Include FormSubmit in the privacy review before the stored-inquiry form is published.
