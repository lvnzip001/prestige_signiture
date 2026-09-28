# The Prestige Signature Standard Academy

Premium hospitality-training website built with generated semantic HTML, Tailwind CSS, local fonts and vanilla JavaScript. Round 2 preserves the approved visual direction and adds private-training and individual-registration paths.

## Build and preview

```sh
npm ci
npm run build
npm run dev
```

Preview at `http://localhost:4173`. Edit page content in `scripts/render-pages.mjs`, booking markup in `scripts/booking-markup.mjs`, styles in `assets/css/input.css`, shared interactions in `assets/js/main.js`, and booking interactions in `assets/js/booking.mjs`. Do not edit generated HTML or `site.css` directly.

For content/style changes: `npm run build:pages` then `npm run build:css`. The full build also optimizes photos. The approved artwork in `assets/images/brand-master.jpg` is used unchanged; browser icons use the complete artwork, resized to fit.

## Booking and inquiries

- `private-training.html`: organizational program selection and direct Stripe links for 50% deposit or full payment.
- `open-enrollment.html`: individual program selection and direct Stripe payment links; training dates arranged with Prestige.
- `booking-confirmation.html`: confirms only server-verified status.
- `assets/js/programs.mjs`: approved prices and exact twelve Stripe Payment Links.
- `assets/js/booking-config.mjs`: configurable scheduling rules and service endpoints.

**Supabase, real availability, payment webhooks and email delivery are deferred to Phase 2 by the user.** The user subsequently authorized direct Stripe payment buttons. `paymentMode` is `payment-links`: all twelve supplied links are active, with no fabricated dates or automatic calendar reservation. Inquiry forms prepare an email draft that the visitor reviews and sends. They do not automatically send email.

See [Phase 2 handoff](docs/PHASE_2_SUPABASE.md) for API contracts, scheduling rules needing confirmation, the Payment Link concurrency limitation, and launch checks. Switch `paymentMode` to `calendar` only after the backend and integrated booking workflow have been tested.

## Verification

```sh
npm run test:quick
npm test
```

Playwright uses installed Chrome and a separate local server at port 4175. The full suite checks fourteen pages at seven widths (360–1920px), accessibility, links/assets, forms and navigation. Booking tests intercept all service calls and Stripe navigations; no payments or messages are sent. Passing these tests is not verification of live Stripe prices or database concurrency.

## Deployment

Publish only generated root HTML, robots/sitemap and runtime assets. Keep client documents, Review, Resources, original photographs, HAR files, scripts, tests and project notes private. Deployments are outside this task. Confirm hosting/domain configuration and physical-device behavior before launch.
