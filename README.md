# The Prestige Signature Standard Academy

Phase 1 static website. Semantic HTML, one compiled CSS file, and a small vanilla JavaScript file. There is no application framework and no backend.

## Preview

\ash
npm install
npm run build
npx serve . -p 4173
\\n
pm run build optimizes the photographs in Resources and compiles ssets/css/input.css to ssets/css/site.css.

Page markup is produced by scripts/render-pages.mjs. After editing that script, run:

\ash
node scripts/render-pages.mjs
npm run build:css
\\n
## Routes

- index.html
- training-programs.html
- prestige-standard.html
- professional-credential.html
- who-we-serve.html
- about.html
- contact.html
- open-enrollment.html
- 404.html

## Phase 1 behavior

Discovery and open-enrollment forms validate in the browser and do not send data. A notice tells the visitor to call or email instead. Supabase wiring is documented in docs/PHASE_2_SUPABASE.md and is not implemented.

## Pre-launch requests

1. A transparent high-resolution master logo (SVG, or a transparent PNG). The supplied logo.png has a black background and is used on the black header and footer only.
2. Official social profile URLs, if any. None are shown until real URLs exist.
3. The PO Box, if it should be published. It is omitted until a real number is supplied.
4. Approved Privacy, Terms, and accessibility statements. Footer slots are not linked until that copy exists.
5. Licensed brand font files, if the academy has them. The site currently uses Cormorant Garamond and Manrope.
6. Confirm the Phase 2 inbox remains nwimbley@prestigesignaturestandard.com.
7. Choose the email provider before form automation is connected.
8. Decide whether future open-enrollment sessions will be managed in the Supabase Dashboard.

Several supplied photographs include printed venue names and sample certificate text. They are used as training photography. The site copy does not name those venues as clients and does not treat the sample certificate name as a graduate.

website_template1.jpg, website_template_2.jpg, and Poster.jpg are references and are not published on the site.
