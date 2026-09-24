# The Prestige Signature Standard Academy

A nine-page, static Phase 1 website built with semantic HTML, Tailwind CSS, local fonts, and vanilla JavaScript. No backend or form submission service is connected.

## Build and preview

```sh
npm ci
npm run build
npm run dev
```

Preview at `http://localhost:4173`. The build optimizes the supplied images, regenerates all pages, then compiles the production CSS. Generated HTML and CSS are committed so the site can also be served directly by a static host.

For markup/content changes, edit `scripts/render-pages.mjs`, then run `npm run build:pages` and `npm run build:css`. For styling, edit `assets/css/input.css`; `npm run watch:css` watches it. Interaction code lives in `assets/js/main.js`.

The image generator reads `Resources`, preserves originals, and creates WebP variants up to each photo’s source resolution. Page generation reads the image manifest rather than maintaining a second list of dimensions. Do not edit generated HTML or `site.css` directly.

## Routes

- `/` / `index.html`
- `training-programs.html`
- `prestige-standard.html`
- `professional-credential.html`
- `who-we-serve.html`
- `about.html`
- `contact.html`
- `open-enrollment.html`
- `404.html`

## Design and behavior

The site uses the approved black, champagne gold, ivory, and cream palette, with locally hosted Cormorant Garamond and Manrope. A photographic homepage hero leads into editorial sections, a keyboard-operated POISE explorer, sector photography, program previews, and the founder story. Mobile program previews support touch scrolling and previous/next buttons.

The header switches to compact navigation below 1440px. Navigation and inquiry dialogs manage focus and scroll locking. Native curriculum and program details work without JavaScript. Reduced-motion preferences disable animation and smooth scrolling.

Discovery links have real `contact.html#discovery-form` destinations; enrollment links lead to `open-enrollment.html#interest-form`. JavaScript enhances these links into quick dialogs. Dedicated pages retain inline forms, even without JavaScript. Public program/industry query parameters are checked against existing select options. Personal information is never put into URLs or local storage.

Forms explain their disconnected status before entry. Submit buttons are disabled in the HTML and enabled only after the local validation handler is attached. Validation displays field errors or an explicit **inquiry not sent** notice. Phone and email links are the immediate contact channels. Future integration is documented in `docs/PHASE_2_SUPABASE.md`.

## Verification

```sh
npm test
npm run test:quick
```

Browser tests use installed Google Chrome in headless mode and a dedicated local server at `127.0.0.1:4175`. If Chrome is missing, install it first or run `npx playwright install chrome`. No running personal browser session is used. The full suite captures all nine pages at 360, 390, 768, 1024, 1280, 1440, and 1920px, and checks accessibility, interactions, no-JavaScript fallbacks, form safety, asset references, and approved commercial details. Screenshots, failure traces, and the JSON report are written to ignored `test-results/`.

## Deployment boundary and pre-launch items

Publish only the generated root HTML, `robots.txt`, `sitemap.xml`, and the runtime assets (`assets/css/site.css`, `assets/js/main.js`, `assets/fonts`, `assets/icons`, and `assets/images/optimized`). Do not publish Resources, originals, client documents, HAR files, scripts, tests, node_modules, or project notes. Configure the static host to use `404.html` for missing routes. Deployment is not part of this change.

Before launch:

1. Supply a high-resolution transparent master logo. Current PNG masters have opaque black backgrounds; they have been preserved faithfully.
2. Supply approved legal copy and any real social profile URLs or PO Box details before adding links.
3. Connect and verify the Phase 2 inquiry service before enabling real submission. Confirm the destination inbox and transactional email provider then.
4. Confirm canonical domain/hosting configuration and test on physical iOS and Android devices.

The visual reference images and poster remain source references only. Venue names and sample certificates visible in photographs are not represented as client endorsements or graduate records. Local font license notices are included beside the font files.
