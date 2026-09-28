# Round 2 integration handoff

The user explicitly deferred Supabase setup, payment confirmation and email delivery to Phase 2. The user subsequently authorized using the exact supplied Stripe Payment Links directly behind the payment buttons. This overrides the earlier requirement to block checkout until calendar integration. Direct payments are now available; dates and agreements are arranged with Prestige, and payments do not automatically reserve calendar slots.

## Current behavior

- The exact `Review/client_logo` image is copied byte-for-byte to `assets/images/brand-master.jpg`. The user confirmed using this full promotional artwork in place of the logo. Header and footer use contain sizing; no cropping or recoloring. Browser icons contain a resized copy of the entire artwork.
- Homepage paths distinguish organizational training from individual Open Enrollment.
- Private cards emphasize outcomes. Starting investments appear inside program details; the registration flow shows relevant amounts.
- Open Enrollment begins November 2, 2026. There is no interest-list model or eight-person minimum in the new flow.
- `paymentMode: payment-links` displays program selection, private deposit/full options and direct checkout links. No personal details are collected on this screen; the visitor enters payment information on Stripe.
- The deferred calendar interface is retained under `paymentMode: calendar`. Calendar/session availability will be supplied only by an authoritative server, never inferred from the browser.
- The discovery form validates and prepares an email addressed to `nwimbley@prestigesignaturestandard.com`. The visitor must open and send it. This is not automatic delivery and does not claim to be.
- Privacy and Terms explain the implemented flow and approved booking facts; no cancellation/refund policy, retention period or agreement terms have been invented.

## Configuration

`assets/js/booking-config.mjs` holds public operating settings and same-origin service endpoint paths. Keep endpoints null until deployed and verified. Never put Supabase service-role keys, Stripe secrets or email credentials in public assets.

Confirm and populate:

- Training weekdays, blackout dates, location(s) and timezone (America/Chicago is a provisional Bryant-based default).
- AM/PM start and end times.
- Registration cutoff hours.
- Whether five-day training uses consecutive calendar days or skips non-training days. Two-day training must occupy consecutive days per the brief.
- Private training opening dates, agreement approval workflow/version, customization and travel charges.
- Cancellation, refund, rescheduling, minimum-age and accessibility-accommodation terms; privacy retention, processors and rights/contact process. Obtain client/legal approval for the integrated booking policies.

The browser currently uses November 2 as the earliest date for both calendars. If private training starts earlier, use a separate private opening-date setting with the backend rules.

## Recommended Phase 2 architecture

Supabase Postgres plus server/Edge Functions for availability, pending bookings, approved agreements and confirmed registrations. Use a server endpoint for inquiries and a transactional email provider. Configure the functions behind same-origin routes, or deliberately update the client origin policy.

Keep all twelve supplied Stripe Payment Links and approved prices in `assets/js/programs.mjs`. Do not create new products or replace the links. On checkout preparation, persist the full selection and return the corresponding existing URL with an opaque `client_reference_id`. Stripe includes this reference in its checkout webhook, allowing the server to look up the date/session.

Stripe references:
- https://docs.stripe.com/payment-links/url-parameters
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/checkout/fulfillment

### Important Payment Link limitation

A reusable Payment Link can be reopened or paid after a temporary calendar hold expires. It has no native per-date capacity lock. Passing a booking reference solves reconciliation, not overselling prevention. Before activating payment, agree the handling of stale/duplicate/unreferenced payments with Prestige. At minimum, verify every payment against the stored booking and available capacity, route exceptions for review/refund, alert Prestige and never confirm conflicting bookings. Short-lived holds need an explicit timeout and cleanup; clicking must not permanently reserve a seat/date.

For strict prevention of *any* out-of-window payment, recommend server-created expiring Checkout Sessions referencing the existing Stripe prices. That would depart from the requirement to use the exact Payment Links and needs client approval. Do not silently substitute that flow. This decision remains necessary before claiming the integrated calendar provides the brief's strongest concurrency guarantee. It does not block the user-authorized direct payment links.

## Front-end API contract

### GET availabilityEndpoint

Query: `kind=private|enrollment`, `program=half-day|full-day|two-day|full-academy`, `month=YYYY-MM`.

Return `{ "slots": [...] }` with each slot:

```json
{
  "id": "opaque-server-slot-id",
  "date": "2026-11-02",
  "dates": ["2026-11-02", "2026-11-03"],
  "session": "DAY",
  "timeLabel": "Approved times and timezone",
  "remaining": 24,
  "status": "available",
  "cohort": true
}
```

`session` is AM, PM or DAY. `status` is available, full or closed. Private slots can return remaining=1. Return every actual training day in dates (not just endpoints). Return full/closed cohort information so the browser can label it. No attendee details in public responses.

### POST checkoutEndpoint

Body includes kind, program, slotId, date, session, payment (`deposit`, `full`, `enrollment`), name, email, phone, company, consent, honeypot and (private only) agreement reference. Validate all fields server-side, enforce origin/CSRF/spam controls and length limits, and derive prices from the trusted catalogue.

In a database transaction: validate the entire slot/date block and cutoff, check manual closure/capacity, verify the private agreement belongs to this customer and covers this program and dates, and create a pending record. Use transaction/advisory locks on the relevant calendar resource to serialize competing requests; browsers must never write availability directly. Require idempotency for retries before launch.

Return `{ "checkoutUrl": "<exact approved link>?client_reference_id=<opaque booking reference>" }`. The frontend checks both the approved URL and the reference. Return HTTP 409 with a safe `message` if a date fills or becomes unavailable; the client preserves details and refreshes availability. Nothing in this request confirms a reservation.

### Stripe webhook

Verify the signature against the raw request body. Handle checkout.session.completed and asynchronous success/failure; fulfill only verified successful payment. Verify the actual Payment Link/product, USD amount, quantity, customer association and reference against the stored record. Use unique event/session/payment IDs for idempotency. Never let a query string or browser success flag confirm a booking.

Atomically reserve AM or PM for Half-Day, both for Full-Day, both across the complete two-day block, and both across all five training days. Prevent private/Open Enrollment overlap. Open Enrollment may share slots only for the identical program, dates and session. The first paid participant creates the cohort. Enforce capacity 25 and configured cutoff/manual closure. Record exceptions separately, without overbooking. Abandoned checkout leaves no permanent reservation. Use an outbox/retry mechanism for confirmation emails after committed registration.

### GET statusEndpoint

Query: `session_id` from the Stripe-controlled redirect. Retrieve/verify the session and return only `{ "status": "confirmed|pending|review|expired" }`, without PII. Set the existing links' approved post-payment redirect to `/booking-confirmation.html?session_id={CHECKOUT_SESSION_ID}` in Stripe. Confirm its behavior in the client's dashboard before launch. The frontend never treats the redirect itself as successful payment.

### Inquiries

Choose a provider (Resend/Postmark/etc.), add a server-side endpoint and replace the email-draft handler with submission. Validate, rate-limit, filter honeypot, durably store the inquiry, send notification to the approved inbox with retry handling, and report success only when accepted by the actual service. Preserve entries on failure. Keep the draft/telephone contact fallback and update Privacy when processors and retention are approved.

## Verification boundary

Local browser tests verify responsive layouts, accessibility, validation, failure states, exact link mapping and payload association using intercepted test endpoints. They never contact Stripe or send an email. They do not verify live Stripe prices, webhook delivery, database concurrency, email inbox delivery or real payments.

Before launch test: all twelve live product/price mappings, signed webhook and event replay, duplicate checkout, last-seat concurrent purchases, private/Open Enrollment conflicts, AM/PM independence, two/five-day blocks, cutoffs, manual closure, expired/abandoned holds, agreement ownership, late and asynchronous payments, confirmation delivery, and physical iOS/Android behavior.
