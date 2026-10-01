# Client review closeout — October 1, 2026

Reviewed all three pages of `Review/Prestige_Website_Updates.pdf` (September 29, 2026). This is an enhancement and consistency pass. The approved visual design and working FormSubmit implementation are preserved. Automatic Stripe payment confirmation is explicitly outside the agreed scope.

## Client requirements

| PDF item | Outcome | Implementation and verification |
| --- | --- | --- |
| 1. Visible desktop navigation | Completed | Seven links from 1280px: Home, Training Programs, The P.O.I.S.E. Method™, Who We Serve, Credential, About, Open Enrollment. Hover/focus dropdowns and the consultation CTA remain. The full hamburger menu works at every width. Header overlap, keyboard dismissal and focus restoration tested at 1280, 1366, 1440 and 1920px. Logo sizing and artwork are unchanged. |
| 2. Choose a program and available date | Already in place; verified | November 2, 2026 opening date; all four programs; separate AM/PM; full-day, two-training-day and five-training-day blocks. Live availability responses checked for both private and individual paths. |
| 2. Capacity, cutoff and manual closure | Already in place; verified | Local PostgreSQL tests execute the actual functions: 25 valid holds fill a cohort; request 26 is rejected; 48-hour cutoff and manual closure reject new bookings; conflicting private/individual programs cannot share a block. Expired holds free space. Browser tests verify Full / Closed and disabled checkout. |
| 2. First confirmed registration establishes a cohort | Corrected; Supabase migration required | Pending holds count against capacity but no longer label the session as an established cohort. The cohort flag becomes true after staff confirm the first registration. Verified against the actual SQL functions. |
| 2. Open Enrollment instructions | Enhanced | States that customers choose dates in the calendar. Retains accurate manual payment-verification wording. No instruction to arrange enrollment dates by email before paying. |
| 3. Direct inquiry submission | Already in place; preserved | Homepage and Private Training dialogs submit directly, show success and clear fields on accepted delivery responses. Failed responses preserve entries. Browser tests intercept the endpoint; FormSubmit code/configuration is unchanged. |
| 3. Business inbox receipt | Client verification outstanding | No live inquiry was sent in this review. The runtime recipient is read from Supabase by the existing server function. Confirm receipt at nwimbley@prestigesignaturestandard.com during the final customer review. Historical setup notes and an unused public test-address setting are not evidence of the current runtime recipient. |
| 4. Booking selection and payment routes | Verified; sequencing improved | Date/session selection precedes checkout. Private deposit/full options now appear after a session is selected. All 12 local routing scenarios preserve the approved link and booking reference. All 12 live URLs loaded and their USD amounts were checked without submitting payment. |
| 4. Automatic payment-to-registration update | Skipped — outside scope | No Stripe webhook, automatic payment reconciliation, automated seat confirmation or replacement Checkout Session flow was added. Academy staff check Stripe, then use Confirm payment. |
| 5. Private conflict protection | Improved; Supabase migration required | Requests already take date/session locks. The new migration uses the same locks for manual confirmation and manual closure, rechecks status after waiting, and checks duplicate requests inside the locked section. This protects late/expired confirmations from conflicting reservations. |
| 5. Pending hold and AM/PM independence | Already in place; verified | A valid temporary hold prevents conflicting requests. The other half-day remains available where appropriate. Agreement and payment verification remain required before staff confirm private training. |
| 5. Guarantee against every conflicting Stripe payment | Skipped — requires excluded payment integration | An existing reusable Stripe link may be reopened after its booking hold expires. The website rejects conflicting reservations, but cannot promise an old Stripe checkout can never accept payment. Staff must review late payments before confirming. |
| 6. Privacy, Terms and process consistency | Completed | Privacy describes direct submissions, Supabase storage, FormSubmit notification and Stripe checkout. Terms describe staff payment verification. Hold language follows the editable academy setting instead of asserting a fixed 16 hours. No refund promises, new agreement terms or other legal commitments were added. Footer policy links remain functional. |
| 7. Functional and responsive QA | Completed locally | See validation below. Phone and tablet checks use browser emulation; physical iPhone/Android and Safari device acceptance remain client-side checks. No production booking, payment or inquiry was created. |
| 8. Preserve approved design/content | Preserved and verified | Black/gold/cream styling, hero headline and imagery, master logo, P.O.I.S.E., founder story, sectors, dual training pathways, de-emphasized home pricing and curriculum unchanged. The approved logo hash test passes. |

## Changes requiring release

Publish the updated generated HTML, JS and CSS through the usual site deployment. Apply only `supabase/migrations/20261001010000_booking_conflict_protection.sql` to the existing Supabase database; do not replay the initial schema or admin seed migrations. This review did not deploy code or migrate the hosted database.

The SQL is covered by `npm run test:booking-db`, using the real migrations in an isolated PostgreSQL engine with a fixed test clock. It covers ten booking scenarios. This engine runs one database connection, so separate-session contention should also be checked in staging after applying the migration.

The booking status page now reads `ref` or the reference saved by the current browser. It does not send an unsupported Stripe `session_id` to the status function or treat a success query parameter as payment evidence. Expired holds advise customers who have paid to contact Prestige before paying again.

## Validation

- Ten focused browser checks: desktop dropdowns/full menu, homepage and Private Training inquiries, iPhone/Android/iPad emulation, and saved-reference status handling.
- Existing functional suite: 34 browser checks covering payment routes, booking errors, mobile accessibility, admin email settings, form behavior, links/assets, branding and navigation.
- Responsive suite: fourteen public pages at 360, 390, 768, 1024, 1280, 1440 and 1920px; accessibility checks at 390 and 1440px.
- Final result: all 142 distinct browser checks pass. Two 1920px checks initially encountered a timed-out local route-detection probe; the probe is now mocked in layout tests, and both checks passed on rerun. The actual live availability endpoint was checked separately. All twelve routing cases were rerun after changing when the private payment choices appear.
- Ten isolated PostgreSQL booking scenarios, including the new migration. No production writes.
- Three existing email unit tests pass. FormSubmit implementation/configuration files have no changes in this review.
- Eight live availability reads: four programs times two booking types, with valid dates, block lengths, sessions and capacity fields.
- Twelve live Stripe URL/amount inspections on October 1, 2026: deposit/full/enrollment USD amounts are $1,875/$3,750/$300; $3,000/$6,000/$500; $5,000/$10,000/$900; $17,500/$35,000/$3,200. Stripe also offered localized currency in this environment; the USD catalogue amounts match.

Automated tests do not prove inbox receipt, real payment settlement, physical-device behavior or production deployment. The client should complete those acceptance checks within the agreed manual-confirmation workflow before calling the site launch-ready.
