import { writeFile } from "node:fs/promises";
import path from "node:path";

const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>`;

const photos = {
  "hero-training": { w: 1536, h: 1024, widths: [640, 960, 1400] },
  "founder-portrait": { w: 1086, h: 1448, widths: [640, 960] },
  "founder-standing": { w: 1024, h: 1536, widths: [640, 960] },
  coaching: { w: 1312, h: 1199, widths: [640, 960] },
  "founder-meeting": { w: 1536, h: 1024, widths: [640, 960, 1400] },
  "fine-dining": { w: 1371, h: 1148, widths: [640, 960] },
  "table-setting": { w: 1312, h: 1199, widths: [640, 960] },
  "place-setting": { w: 1371, h: 1148, widths: [640, 960] },
  "table-service": { w: 1312, h: 1199, widths: [640, 960] },
  "plate-service": { w: 1024, h: 1536, widths: [640, 960] },
  "club-service": { w: 1024, h: 1536, widths: [640, 960] },
  "beverage-service": { w: 1370, h: 1148, widths: [640, 960] },
  "bottle-service": { w: 1086, h: 1448, widths: [640, 960] },
  "credential-moment": { w: 1370, h: 1148, widths: [640, 960] },
  "academy-training": { w: 1370, h: 1148, widths: [640, 960] },
  "service-team": { w: 1024, h: 1536, widths: [640, 960] },
  "hospitality-professional": { w: 1024, h: 1536, widths: [640, 960] },
  "training-room": { w: 1536, h: 1024, widths: [640, 960, 1400] },
};

const nav = [
  ["training-programs.html", "Training Programs"],
  ["prestige-standard.html", "The Prestige Standard"],
  ["professional-credential.html", "Professional Credential"],
  ["who-we-serve.html", "Who We Serve"],
  ["about.html", "About"],
  ["contact.html", "Contact"],
];

function img(name, alt, options = {}) {
  const photo = photos[name];
  const sizes = options.sizes || "(min-width: 900px) 50vw, 100vw";
  const srcset = photo.widths.map((w) => `assets/images/optimized/${name}-${w}.webp ${w}w`).join(", ");
  const largest = photo.widths[photo.widths.length - 1];
  const loading = options.eager ? `loading="eager" fetchpriority="high"` : `loading="lazy" decoding="async"`;
  const pos = options.position ? ` style="object-position:${options.position}"` : "";
  const cls = options.className ? ` class="${options.className}"` : "";
  return `<img src="assets/images/optimized/${name}-${largest}.webp" srcset="${srcset}" sizes="${sizes}" width="${photo.w}" height="${photo.h}" alt="${alt}"${cls} ${loading}${pos}>`;
}

function button(label, href, variant = "btn-ink") {
  return `<a class="btn ${variant}" href="${href}">${label}${arrow}</a>`;
}

function modalButton(label, modal, variant = "btn-ink", options = {}) {
  const mark = options.arrow === false ? "" : arrow;
  const preset = options.preset
    ? ` data-preset-field="${options.preset.field}" data-preset-value="${options.preset.value}"`
    : "";
  return `<button class="btn ${variant}" type="button" data-open-modal="${modal}"${preset}>${label}${mark}</button>`;
}

function header() {
  const links = nav
    .map(([href, label]) => `<a data-nav href="${href}">${label}</a>`)
    .join("\n        ");
  const mobileLinks = nav
    .map(([href, label]) => `<a data-nav href="${href}">${label}</a>`)
    .join("\n          ");
  return `<header class="site-header" data-header>
    <div class="header-inner">
      <a class="brand" href="index.html">
        <img src="assets/images/optimized/logo-main.png" width="1127" height="877" alt="The Prestige Signature Standard Academy">
      </a>
      <nav class="desktop-nav" aria-label="Primary">
        ${links}
        <a data-nav class="nav-enroll" href="open-enrollment.html">Open Enrollment</a>
      </nav>
      <button class="btn btn-light header-cta" type="button" data-open-modal="discovery">Schedule a Discovery Consultation</button>
      <a class="header-enroll" data-nav href="open-enrollment.html">Open Enrollment</a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav">
        <span class="sr-only">Menu</span>
        <span class="nav-toggle-bars" aria-hidden="true"></span>
      </button>
    </div>
    <div id="mobile-nav" class="mobile-nav" data-nav-panel hidden>
      <nav aria-label="Mobile">
        <button class="btn btn-light" type="button" data-open-modal="discovery">Schedule a Discovery Consultation</button>
        <a data-nav class="mobile-enroll" href="open-enrollment.html">Open Enrollment</a>
          ${mobileLinks}
      </nav>
    </div>
  </header>`;
}

function footer() {
  const links = nav
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("\n        ");
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-brand stack">
        <img src="assets/images/optimized/logo-main.png" width="1127" height="877" alt="The Prestige Signature Standard Academy">
        <p>Professional Hospitality Service Training</p>
        <p>The Prestige Signature Standard™<br>P.O.I.S.E. Method™</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <a href="index.html">Home</a>
        ${links}
        <a href="open-enrollment.html">Open Enrollment</a>
      </nav>
      <div class="footer-contact">
        <button class="link-button" type="button" data-open-modal="discovery">Schedule a Discovery Consultation</button>
        <a href="tel:+15015595118">501-559-5118</a>
        <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>
        <p>Bryant, Arkansas</p>
      </div>
    </div>
    <!-- Legal links stay unpublished until approved Privacy and Terms copy is supplied. -->
    <div class="wrap footer-base">
      <p>&copy; <span data-year>2026</span> The Prestige Signature Standard Academy. All rights reserved.</p>
    </div>
  </footer>`;
}

function layout({ file, title, description, path: urlPath, body }) {
  const url = `https://prestigesignaturestandard.com${urlPath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Prestige Signature Standard Academy">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://prestigesignaturestandard.com/assets/images/optimized/og.jpg">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://prestigesignaturestandard.com/assets/images/optimized/og.jpg">
  <meta name="theme-color" content="#171512">
  <link rel="icon" href="assets/icons/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
  <link rel="stylesheet" href="assets/css/site.css">
  <script>document.documentElement.classList.add("js")</script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "The Prestige Signature Standard Academy",
    "url": "https://prestigesignaturestandard.com/",
    "logo": "https://prestigesignaturestandard.com/assets/images/optimized/logo-main.png",
    "email": "nwimbley@prestigesignaturestandard.com",
    "telephone": "+1-501-559-5118",
    "description": "Professional hospitality service training for restaurants, hotels, clubs and event teams.",
    "founder": {
      "@type": "Person",
      "name": "Nonceba Wimbley",
      "jobTitle": "Founder & Chief Executive Officer"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bryant",
      "addressRegion": "AR",
      "addressCountry": "US"
    },
    "areaServed": "Worldwide"
  }
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header()}
  <main id="main">
${body}
  </main>
  ${footer()}
  ${modals()}
  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

function heroBlock({ image, alt, position = "center", kicker, title, lead, actions, page = false, titleClass = "" }) {
  return `    <section class="${page ? "page-hero" : "hero"}">
      <div class="hero-stage">
        <div class="hero-copy">
          ${kicker ? `<p class="eyebrow eyebrow-light">${kicker}</p>` : ""}
          <h1 class="${page ? "page-title" : "hero-title"}${titleClass ? " " + titleClass : ""}">${title}</h1>
          ${lead ? `<p class="lead">${lead}</p>` : ""}
          ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
        </div>
        <div class="hero-visual">
          ${img(image, alt, { eager: true, sizes: "(min-width: 900px) 58vw, 100vw", position, className: "hero-media" })}
        </div>
      </div>
    </section>`;
}

function closing(title, copy, label, href) {
  return `    <section class="section bg-ink light-type">
      <div class="wrap reveal">
        <h2 class="section-title">${title}</h2>
        <p class="lead mt-6">${copy}</p>
        <div class="actions">${href === "contact.html#discovery-form" ? modalButton(label, "discovery", "btn-light") : button(label, href, "btn-light")}</div>
      </div>
    </section>`;
}

const programs = [
  ["half-day", "Half-Day Customized Training", "3,750", "Focused skill gaps, refresher training or selected modules."],
  ["full-day", "Full-Day Customized Training", "6,000", "Broader service reset or multi-module development."],
  ["two-day", "Two-Day Signature Program", "10,000", "Deeper technical, behavioral and guest-experience development."],
  ["full-academy", "Five-Day Prestige Full Academy", "35,000", "Comprehensive service development and professional credential pathway."],
];

const modules = [
  ["Professional Presence &amp; Appearance", "Image, grooming, posture and how a professional enters the room."],
  ["Tools of the Trade", "The tools of service, handled correctly."],
  ["Table &amp; Place Setting", "Setup, place settings and readiness."],
  ["Plate Handling", "Safe, controlled plate service."],
  ["Glassware", "Recognition, handling and presentation."],
  ["Beverage Service", "Presentation, handling and guest technique."],
  ["Bottle Service", "Presentation, handling and pouring mechanics."],
  ["The Guest Approach", "How to approach, greet and begin the relationship."],
  ["Communication", "Clear, respectful communication with different guests."],
  ["Reading the Table", "When to act, and when not to interrupt."],
  ["The Prestige Service Sequence", "How the techniques connect into one service."],
  ["Table Maintenance", "Cleanliness, order and guest comfort through the meal."],
  ["Anticipating Guest Needs", "From reacting to noticing what is needed next."],
  ["Difficult Guests &amp; Service Recovery", "Composure and recovery when service goes wrong."],
  ["The Final Experience", "Capstone using the Prestige Standard™ and P.O.I.S.E. Method™."],
];

const poise = [
  ["P", "Presence", "Confidence and readiness before the first word."],
  ["O", "Observe", "Read the guest and the room before you act."],
  ["I", "Initiate", "Act before every need has to be asked for."],
  ["S", "Serve", "Technical and personal details, done with care."],
  ["E", "Elevate", "Make correct service feel personal."],
];

const sectors = [
  ["restaurants", "Restaurants &amp; Fine Dining", "Presence, technique, table awareness and consistency.", "fine-dining", "A server presenting plates to guests in a fine-dining room.", "center"],
  ["hotels", "Hotels &amp; Resorts", "Polished guest-facing service where the brand experience matters.", "hospitality-professional", "A server carrying beverages along a resort pool terrace.", "center 30%"],
  ["golf", "Golf &amp; Country Clubs", "Attentive service for members, guests, dining and events.", "club-service", "A server carrying plates to guests on a club terrace beside a golf course.", "center 20%"],
  ["private-clubs", "Private Clubs", "Discretion, professionalism and anticipation.", "service-team", "A uniformed service team standing together in a hotel lobby.", "center 15%"],
  ["events", "Event &amp; Banquet Venues", "Coordinated service in a fast room.", "place-setting", "A server finishing glassware and flowers on an outdoor banquet table.", "center"],
  ["catering", "Catering &amp; Event-Service Teams", "The same standard across changing venues.", "plate-service", "A server carrying a plated dish and service cloth through a dining room.", "center 20%"],
];

function programRows(linked) {
  return programs
    .map(([id, name, price, copy]) => {
      const inner = `<div>
            <h3 class="subhead">${name}</h3>
            <p class="mt-3">${copy}</p>
          </div>
          <p>Up to 25 participants.</p>
          <p class="price"><small>Starting at</small>$${price}</p>`;
      if (!linked) {
        return `<article class="program-row" id="${id}">${inner}</article>`;
      }
      return `<a class="program-row" href="training-programs.html#${id}">${inner}</a>`;
    })
    .join("\n        ");
}

function accordion() {
  return modules
    .map(([title, copy], index) => {
      const n = String(index + 1).padStart(2, "0");
      return `<div class="accordion">
          <h3>
            <button class="accordion-trigger" id="module-btn-${index + 1}" type="button" aria-expanded="false" aria-controls="module-${index + 1}" data-accordion>
              <span class="accordion-index">${n}</span>
              <span>${title}</span>
              <span class="accordion-icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="accordion-panel" id="module-${index + 1}" role="region" aria-labelledby="module-btn-${index + 1}" hidden>
            <p>${copy}</p>
          </div>
        </div>`;
    })
    .join("\n        ");
}

function hiddenMeta(source) {
  return `<input type="hidden" name="source_page" value="${source}">
        <input type="hidden" name="utm_source" value="">
        <input type="hidden" name="utm_medium" value="">
        <input type="hidden" name="utm_campaign" value="">
        <div class="hp" aria-hidden="true">
          <label for="${source}-website">Website</label>
          <input class="hp-input" id="${source}-website" name="company_website" type="text" tabindex="-1" autocomplete="off">
        </div>`;
}

function formNotice() {
  return `<div class="form-notice" data-form-notice hidden tabindex="-1" role="status">
          <p><strong>Online submission is being connected.</strong> This form did not send your inquiry.</p>
          <p class="mt-3">Call <a href="tel:+15015595118">501-559-5118</a> or email <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>.</p>
        </div>`;
}

function modals() {
  return `<dialog class="modal" id="discovery-form" data-modal="discovery" aria-labelledby="discovery-modal-title">
  <div class="modal-panel">
    <div class="modal-toolbar">
      <button class="modal-close" type="button" data-close-modal>Close</button>
    </div>
    <p class="eyebrow">Discovery</p>
    <h2 id="discovery-modal-title" class="subhead">Schedule a Discovery Consultation</h2>
    <p class="modal-lead">Nothing is sent until online submission is connected.</p>
    <form action="#" method="post" novalidate data-phase1-form>
      ${hiddenMeta("contact")}
      <div class="form-grid two">
        <div class="field">
          <label for="name">Name <span aria-hidden="true">*</span></label>
          <input id="name" name="name" type="text" required autocomplete="name" aria-describedby="name-error">
          <p class="field-error" id="name-error" data-error-for="name"></p>
        </div>
        <div class="field">
          <label for="company">Company <span aria-hidden="true">*</span></label>
          <input id="company" name="company" type="text" required autocomplete="organization" aria-describedby="company-error">
          <p class="field-error" id="company-error" data-error-for="company"></p>
        </div>
        <div class="field">
          <label for="title">Title</label>
          <input id="title" name="title" type="text" autocomplete="organization-title" aria-describedby="title-error">
          <p class="field-error" id="title-error" data-error-for="title"></p>
        </div>
        <div class="field">
          <label for="email">Email <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
          <p class="field-error" id="email-error" data-error-for="email"></p>
        </div>
        <div class="field">
          <label for="phone">Phone <span aria-hidden="true">*</span></label>
          <input id="phone" name="phone" type="tel" required autocomplete="tel" aria-describedby="phone-error">
          <p class="field-error" id="phone-error" data-error-for="phone"></p>
        </div>
        <div class="field">
          <label for="industry">Industry <span aria-hidden="true">*</span></label>
          <select id="industry" name="industry" required aria-describedby="industry-error">
            <option value="">Select an industry</option>
            <option>Restaurant</option>
            <option>Hotel-Resort</option>
            <option>Golf-Country Club</option>
            <option>Private Club</option>
            <option>Event-Banquet</option>
            <option>Catering</option>
            <option>Other</option>
          </select>
          <p class="field-error" id="industry-error" data-error-for="industry"></p>
        </div>
        <div class="field">
          <label for="employee_count">Number of Employees to Train <span aria-hidden="true">*</span></label>
          <input id="employee_count" name="employee_count" type="number" min="1" required inputmode="numeric" aria-describedby="employee_count-error">
          <p class="field-error" id="employee_count-error" data-error-for="employee_count"></p>
        </div>
        <div class="field">
          <label for="city_state">City / State <span aria-hidden="true">*</span></label>
          <input id="city_state" name="city_state" type="text" required autocomplete="address-level2" aria-describedby="city_state-error">
          <p class="field-error" id="city_state-error" data-error-for="city_state"></p>
        </div>
        <div class="field">
          <label for="training_interest">Training Interest <span aria-hidden="true">*</span></label>
          <select id="training_interest" name="training_interest" required aria-describedby="training_interest-error">
            <option value="">Select a program</option>
            <option>Half-Day</option>
            <option>Full-Day</option>
            <option>Two-Day</option>
            <option>Full Academy</option>
            <option>Open Enrollment</option>
            <option>Not Sure</option>
          </select>
          <p class="field-error" id="training_interest-error" data-error-for="training_interest"></p>
        </div>
        <div class="field">
          <label for="desired_timing">Desired Timing <span aria-hidden="true">*</span></label>
          <input id="desired_timing" name="desired_timing" type="text" required aria-describedby="desired_timing-error">
          <p class="field-error" id="desired_timing-error" data-error-for="desired_timing"></p>
        </div>
        <div class="field span-2">
          <label for="service_challenge">Current Service Challenge</label>
          <textarea id="service_challenge" name="service_challenge" aria-describedby="service_challenge-error"></textarea>
          <p class="field-error" id="service_challenge-error" data-error-for="service_challenge"></p>
        </div>
        <div class="field span-2">
          <div class="check">
            <input id="consent" name="consent" type="checkbox" value="yes" required aria-describedby="consent-error">
            <label for="consent">I give Prestige permission to contact me about this inquiry. <span aria-hidden="true">*</span></label>
          </div>
          <p class="field-error" id="consent-error" data-error-for="consent"></p>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-ink" type="submit">Schedule a Discovery Consultation${arrow}</button>
      </div>
      ${formNotice()}
    </form>
  </div>
</dialog>
<dialog class="modal" id="interest-form" data-modal="enrollment" aria-labelledby="interest-modal-title">
  <div class="modal-panel">
    <div class="modal-toolbar">
      <button class="modal-close" type="button" data-close-modal>Close</button>
    </div>
    <p class="eyebrow">Open Enrollment</p>
    <h2 id="interest-modal-title" class="subhead">Join the Interest List</h2>
    <p class="modal-lead">No date is promised. Nothing is sent until online submission is connected.</p>
    <form action="#" method="post" novalidate data-phase1-form>
      ${hiddenMeta("enrollment")}
      <div class="form-grid two">
        <div class="field">
          <label for="oe-name">Name <span aria-hidden="true">*</span></label>
          <input id="oe-name" name="name" type="text" required autocomplete="name" aria-describedby="oe-name-error">
          <p class="field-error" id="oe-name-error" data-error-for="oe-name"></p>
        </div>
        <div class="field">
          <label for="oe-email">Email <span aria-hidden="true">*</span></label>
          <input id="oe-email" name="email" type="email" required autocomplete="email" aria-describedby="oe-email-error">
          <p class="field-error" id="oe-email-error" data-error-for="oe-email"></p>
        </div>
        <div class="field">
          <label for="oe-phone">Phone <span aria-hidden="true">*</span></label>
          <input id="oe-phone" name="phone" type="tel" required autocomplete="tel" aria-describedby="oe-phone-error">
          <p class="field-error" id="oe-phone-error" data-error-for="oe-phone"></p>
        </div>
        <div class="field">
          <label for="oe-city">City / State <span aria-hidden="true">*</span></label>
          <input id="oe-city" name="city_state" type="text" required autocomplete="address-level2" aria-describedby="oe-city-error">
          <p class="field-error" id="oe-city-error" data-error-for="oe-city"></p>
        </div>
        <div class="field span-2">
          <label for="oe-role">Employer / role</label>
          <input id="oe-role" name="employer_role" type="text" autocomplete="organization-title" aria-describedby="oe-role-error">
          <p class="field-error" id="oe-role-error" data-error-for="oe-role"></p>
        </div>
        <div class="field">
          <label for="oe-program">Program interest <span aria-hidden="true">*</span></label>
          <select id="oe-program" name="program_interest" required aria-describedby="oe-program-error">
            <option value="">Select a program</option>
            <option>Half-Day</option>
            <option>Full-Day</option>
            <option>Two-Day</option>
            <option>Full Academy</option>
            <option>Not Sure</option>
          </select>
          <p class="field-error" id="oe-program-error" data-error-for="oe-program"></p>
        </div>
        <div class="field">
          <label for="oe-time">Preferred timeframe <span aria-hidden="true">*</span></label>
          <input id="oe-time" name="preferred_timeframe" type="text" required aria-describedby="oe-time-error">
          <p class="field-error" id="oe-time-error" data-error-for="oe-time"></p>
        </div>
        <div class="field span-2">
          <div class="check">
            <input id="oe-consent" name="consent" type="checkbox" value="yes" required aria-describedby="oe-consent-error">
            <label for="oe-consent">I agree to be contacted about open enrollment. <span aria-hidden="true">*</span></label>
          </div>
          <p class="field-error" id="oe-consent-error" data-error-for="oe-consent"></p>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-ink" type="submit">Join the Interest List${arrow}</button>
      </div>
      ${formNotice()}
    </form>
  </div>
</dialog>`;
}

const home = layout({
  file: "index.html",
  title: "Professional Hospitality Service Training | Prestige Signature Standard Academy",
  description: "Professional hospitality service training for restaurants, hotels, clubs and event teams. Build polished professionals and memorable guest experiences.",
  path: "/",
  body: `
${heroBlock({
  image: "hero-training",
  alt: "Nonceba Wimbley demonstrating wine glassware to hospitality professionals during academy training.",
  position: "72% center",
  kicker: "Professional Hospitality Service Training",
  title: "Create Experiences Worth Remembering.",
  lead: "Skill, presence and service standards for exceptional guest experiences.",
  actions: `${modalButton("Schedule a Discovery Consultation", "discovery", "btn-light")}${button("Explore Training Programs", "training-programs.html", "btn-ghost")}`,
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">The Prestige Difference</p>
          <h2 class="section-title title-wide">We don’t just train people to serve. We train professionals to create experiences worth remembering.</h2>
          <div class="media-frame mt-8">
            ${img("plate-service", "A server carrying a plated dish and service cloth through a dining room.", { position: "center 20%", sizes: "(min-width: 900px) 46vw, 100vw" })}
          </div>
        </div>
        <ul class="capability-list reveal">
          <li>Practical, hands-on service training</li>
          <li>Professional presence and etiquette</li>
          <li>Guest communication and judgment</li>
          <li>Technical service execution</li>
          <li>Assessment and credential pathway</li>
        </ul>
      </div>
    </section>

    <section class="section bg-ink light-type">
      <div class="wrap reveal">
        <p class="eyebrow eyebrow-light">Powered by the P.O.I.S.E. Method™</p>
        <h2 class="section-title">The Prestige Signature Standard™</h2>
        <ol class="poise">
          ${poise.map(([letter, word]) => `<li><span class="poise-letter">${letter}</span><span class="poise-word">${word}</span></li>`).join("")}
        </ol>
        <div class="actions">${button("The Prestige Standard", "prestige-standard.html", "btn-ghost")}</div>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap">
        <div class="reveal flex flex-wrap items-end justify-between gap-6">
          <h2 class="section-title">Who We Serve</h2>
          ${button("Who We Serve", "who-we-serve.html", "btn-ghost-ink")}
        </div>
        <div class="sector-mosaic mt-8">
          <a class="sector-card tall" href="who-we-serve.html#restaurants">
            ${img("fine-dining", "A server presenting plates to guests in a fine-dining room.", { sizes: "(min-width: 720px) 58vw, 100vw" })}
            <span>Restaurants &amp; Fine Dining</span>
          </a>
          <a class="sector-card" href="who-we-serve.html#hotels">
            ${img("hospitality-professional", "A server carrying beverages along a resort pool terrace.", { position: "center 25%", sizes: "(min-width: 720px) 40vw, 100vw" })}
            <span>Hotels &amp; Resorts</span>
          </a>
          <a class="sector-card" href="who-we-serve.html#golf">
            ${img("club-service", "A server carrying plates to guests on a club terrace beside a golf course.", { position: "center 18%", sizes: "(min-width: 720px) 40vw, 100vw" })}
            <span>Golf &amp; Country Clubs</span>
          </a>
        </div>
        <div class="sector-mosaic three mt-3">
          <a class="sector-card" href="who-we-serve.html#private-clubs">
            ${img("service-team", "A uniformed service team standing together in a hotel lobby.", { position: "center 12%", sizes: "(min-width: 720px) 33vw, 100vw" })}
            <span>Private Clubs</span>
          </a>
          <a class="sector-card" href="who-we-serve.html#events">
            ${img("place-setting", "A server finishing glassware and flowers on an outdoor banquet table.", { sizes: "(min-width: 720px) 33vw, 100vw" })}
            <span>Event &amp; Banquet Venues</span>
          </a>
          <a class="sector-card" href="who-we-serve.html#catering">
            ${img("beverage-service", "A bartender pouring a drink for a guest at a club bar.", { sizes: "(min-width: 720px) 33vw, 100vw" })}
            <span>Catering &amp; Event-Service Teams</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap">
        <div class="grid gap-10 min-[900px]:grid-cols-2 min-[900px]:items-center">
          <div class="media-frame reveal">
            ${img("coaching", "Nonceba Wimbley coaching a server on plate presentation at a set table.", { sizes: "(min-width: 900px) 46vw, 100vw" })}
          </div>
          <div class="reveal">
            <p class="eyebrow">Learning model</p>
            <h2 class="section-title">Training That Goes Beyond the Lecture</h2>
            <p class="lead mt-6">See the skill. Learn why it matters. Practice it. Then show you can do it.</p>
          </div>
        </div>
        <ol class="method-row reveal">
          <li><span>Demonstration</span></li>
          <li><span>Explanation</span></li>
          <li><span>Practice</span></li>
          <li><span>Assessment</span></li>
        </ol>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap reveal">
        <p class="eyebrow">Private cohorts</p>
        <h2 class="section-title">Flagship Programs</h2>
        <p class="lead mt-6">Prices are per cohort of up to 25.</p>
        <div class="mt-8">
        ${programRows(true)}
        </div>
        <div class="actions">${button("Explore Training Programs", "training-programs.html")}</div>
      </div>
    </section>

    <section class="bg-cream">
      <div class="grid min-[900px]:grid-cols-2">
        <div class="media-frame bleed-media">
          ${img("founder-standing", "Nonceba Wimbley, Founder and Chief Executive Officer.", { position: "center 12%", sizes: "(min-width: 900px) 50vw, 100vw" })}
        </div>
        <div class="founder-copy reveal">
          <p class="eyebrow">Founder &amp; Chief Executive Officer</p>
          <h2 class="section-title title-wide">Meet Nonceba Wimbley — Founder &amp; Chief Executive Officer</h2>
          <blockquote class="founder-quote mt-8">Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.</blockquote>
          <div class="actions">${button("Meet Our Founder", "about.html")}</div>
        </div>
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. We start with discovery.",
  "Schedule a Discovery Consultation",
  "contact.html#discovery-form"
)}
`,
});

const training = layout({
  file: "training-programs.html",
  title: "Hospitality Training Programs | Prestige Signature Standard Academy",
  description: "Half-day, full-day, two-day and five-day hospitality training for private cohorts of up to 25. Starting prices and the 15-module Prestige curriculum.",
  path: "/training-programs.html",
  body: `
${heroBlock({
  page: true,
  image: "training-room",
  alt: "A Prestige training room prepared with glassware, place settings and service uniforms.",
  position: "center",
  kicker: "Training Programs",
  title: "Professional Training Built Around the Guest Experience",
  titleClass: "compact",
  lead: "From a focused reset to the Full Academy. Customized for your organization. The Prestige standard stays.",
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-12">
        <div class="min-[900px]:col-span-5 reveal">
          <p class="eyebrow">Private program terms</p>
          <h2 class="section-title">Private cohorts of up to 25.</h2>
        </div>
        <ul class="rule-list min-[900px]:col-span-7 reveal">
          <li>Maximum standard private cohort: 25 participants.</li>
          <li>Clients may select modules.</li>
          <li>No automatic discount for 1–5 short-program cohorts.</li>
          <li>Six or more cohorts, or 126 or more participants, are quoted individually.</li>
          <li>Full Academy multi-cohort pricing follows the approved current pricing guide.</li>
        </ul>
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap reveal">
        <h2 class="section-title">Programs and starting prices</h2>
        <p class="mt-6 max-w-3xl">Starting prices, per cohort of up to 25.</p>
        <div class="mt-8">
        ${programRows(false)}
        </div>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[1000px]:grid-cols-12">
        <div class="min-[1000px]:col-span-4 reveal">
          <p class="eyebrow">Curriculum</p>
          <h2 class="section-title">Curriculum</h2>
          <p class="mt-6">Public module names only. Lesson plans and rubrics stay with the instructor.</p>
          <div class="media-frame mt-8">
            ${img("academy-training", "Hospitality professionals practicing glassware, plate and service-tool standards.", { sizes: "(min-width: 1000px) 32vw, 100vw" })}
          </div>
        </div>
        <div class="min-[1000px]:col-span-8 reveal">
        ${accordion()}
        </div>
      </div>
    </section>

${closing(
  "Request a custom training proposal",
  "Tell us what your team is experiencing. We start with discovery.",
  "Request a Custom Training Proposal",
  "contact.html#discovery-form"
)}
`,
});

const standard = layout({
  file: "prestige-standard.html",
  title: "The Prestige Signature Standard & P.O.I.S.E. Method",
  description: "The Prestige Signature Standard and P.O.I.S.E. Method: Presence, Observe, Initiate, Serve and Elevate, taught through demonstration, explanation, practice and assessment.",
  path: "/prestige-standard.html",
  body: `
${heroBlock({
  page: true,
  image: "table-setting",
  alt: "A formal place setting with gold-rimmed china, glassware and folded linen.",
  kicker: "The Prestige Signature Standard™",
  title: "Service Is More Than a Task. It Is a Standard.",
  lead: "How a professional presents, observes, acts, serves and elevates the guest experience.",
})}

    <section class="section bg-ink light-type">
      <div class="wrap reveal">
        <p class="eyebrow eyebrow-light">P.O.I.S.E. Method™</p>
        <h2 class="section-title sequence">Presence → Observe → Initiate → Serve → Elevate</h2>
        <ol class="poise">
          ${poise.map(([letter, word]) => `<li><span class="poise-letter">${letter}</span><span class="poise-word">${word}</span></li>`).join("")}
        </ol>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap grid gap-10">
        ${poise
          .map(([letter, word, copy], index) => {
            const visuals = [
              ["founder-portrait", "Portrait of Nonceba Wimbley, Founder and Chief Executive Officer.", "center 18%"],
              ["table-service", "A server speaking with guests at a dining table.", "center"],
              ["coaching", "Nonceba Wimbley coaching a server on plate presentation at a set table.", "center"],
              ["bottle-service", "A server presenting a wine bottle at a dining table.", "center 20%"],
              ["fine-dining", "A server presenting plates to guests in a fine-dining room.", "center"],
            ];
            const [name, alt, position] = visuals[index];
            return `<article class="sector-row${index % 2 ? " reverse" : ""}">
            <div class="media-frame">${img(name, alt, { position, sizes: "(min-width: 900px) 52vw, 100vw" })}</div>
            <div class="sector-copy">
              <p class="eyebrow">${letter}</p>
              <h2 class="section-title">${word}</h2>
              <p class="lead mt-6">${copy}</p>
            </div>
          </article>`;
          })
          .join("\n        ")}
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap reveal">
        <p class="eyebrow">Instructional method</p>
        <h2 class="section-title title-wide">Exceptional service should be felt, not just taught.</h2>
        <ol class="method-row">
          <li><span>Demonstration</span></li>
          <li><span>Explanation</span></li>
          <li><span>Practice</span></li>
          <li><span>Assessment</span></li>
        </ol>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap grid gap-10 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">Client standards</p>
          <h2 class="section-title">Client SOP integration</h2>
          <p class="lead mt-6">We teach the professional standard, then layer in your approved procedures. We do not replace them.</p>
        </div>
        <div class="media-frame reveal">
          ${img("training-room", "A Prestige training room prepared with glassware, place settings and service uniforms.", { sizes: "(min-width: 900px) 46vw, 100vw" })}
        </div>
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. We start with discovery.",
  "Schedule a Discovery Consultation",
  "contact.html#discovery-form"
)}
`,
});

const credential = layout({
  file: "professional-credential.html",
  title: "Prestige Professional Service Credential | Hospitality",
  description: "The Prestige Signature Standard Professional Service Credential is earned through the Five-Day Full Academy: attendance, knowledge, practical assessment and the Module 15 capstone.",
  path: "/professional-credential.html",
  body: `
${heroBlock({
  page: true,
  image: "credential-moment",
  alt: "A certificate presentation during a Prestige academy recognition moment.",
  position: "center",
  kicker: "Professional credential",
  title: "Prestige Signature Standard Professional Service Credential™",
  titleClass: "compact",
  lead: "Earned in the Five-Day Full Academy: knowledge, practical skill and the capstone.",
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-12">
        <div class="min-[900px]:col-span-5 reveal">
          <p class="eyebrow">Requirements</p>
          <h2 class="section-title">Credential requirements</h2>
        </div>
        <ul class="rule-list min-[900px]:col-span-7 reveal">
          <li>Five-Day Full Academy eligibility.</li>
          <li>90% attendance.</li>
          <li>80% knowledge assessment.</li>
          <li>80% practical assessment.</li>
          <li>Successful Module 15 capstone.</li>
          <li>Acceptable professional conduct, communication, presence and safe service.</li>
        </ul>
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap reveal">
        <h2 class="section-title title-wide">Certificate of Completion and the Professional Service Credential</h2>
        <div class="compare mt-8">
          <article>
            <h3 class="subhead">Certificate of Completion</h3>
            <p class="mt-4">Confirms participation. It is not the professional credential.</p>
          </article>
          <article class="compare-ink">
            <h3 class="subhead">Professional Service Credential</h3>
            <p class="mt-4">Earned only when the Full Academy requirements are met.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap reveal">
        <p class="eyebrow">Validity and renewal</p>
        <h2 class="section-title">Validity and renewal</h2>
        <p class="mt-6 max-w-3xl">Valid for two years. Public verification is not available yet.</p>
        <table class="data-table mt-8">
          <thead>
            <tr><th scope="col">Path</th><th scope="col">Fee</th></tr>
          </thead>
          <tbody>
            <tr><td>Standard 2-Year Renewal</td><td>$650</td></tr>
            <tr><td>Late Reinstatement, 46 days to 1 year expired</td><td>$800</td></tr>
            <tr><td>Full Re-Certification Assessment, over 1 year expired</td><td>$950</td></tr>
            <tr><td>First retest within 30 days</td><td>Complimentary</td></tr>
          </tbody>
        </table>
        <div class="actions">${modalButton("Ask About the Full Academy", "discovery", "btn-ink", { preset: { field: "training_interest", value: "Full Academy" } })}</div>
      </div>
    </section>
`,
});

const who = layout({
  file: "who-we-serve.html",
  title: "Hospitality Service Training for Restaurants, Hotels & Clubs",
  description: "Prestige trains restaurants, hotels, resorts, golf and country clubs, private clubs, banquet venues and catering teams without replacing approved operating procedures.",
  path: "/who-we-serve.html",
  body: `
${heroBlock({
  page: true,
  image: "fine-dining",
  alt: "A server presenting plates to guests in a fine-dining room.",
  kicker: "Who We Serve",
  title: "Restaurants, hotels, clubs and event teams.",
  titleClass: "compact",
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-10 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">Your Standards + The Prestige Standard</p>
          <h2 class="section-title">Your Standards + The Prestige Standard</h2>
          <p class="lead mt-6">We do not replace your procedures. We teach the professional foundation, then your standards where they apply.</p>
        </div>
        <div class="media-frame reveal">
          ${img("founder-meeting", "Nonceba Wimbley in a discovery conversation with hospitality leaders.", { sizes: "(min-width: 900px) 46vw, 100vw" })}
        </div>
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap">
        ${sectors
          .map(([id, title, copy, image, alt, position], index) => `<article class="sector-row${index % 2 ? " reverse" : ""}" id="${id}">
          <div class="media-frame">${img(image, alt, { position, sizes: "(min-width: 900px) 52vw, 100vw" })}</div>
          <div class="sector-copy">
            <h2 class="subhead">${title}</h2>
            <p class="lead mt-5">${copy}</p>
          </div>
        </article>`)
          .join("\n        ")}
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. We start with discovery.",
  "Schedule a Discovery Consultation",
  "contact.html#discovery-form"
)}
`,
});

const about = layout({
  file: "about.html",
  title: "About Nonceba Wimbley & The Prestige Academy",
  description: "Nonceba Wimbley, Founder and Chief Executive Officer, built The Prestige Signature Standard Academy from a hospitality career that began in Cape Town in 2008.",
  path: "/about.html",
  body: `
${heroBlock({
  page: true,
  image: "founder-portrait",
  alt: "Portrait of Nonceba Wimbley, Founder and Chief Executive Officer.",
  position: "center 18%",
  kicker: "Founder &amp; Chief Executive Officer",
  title: "Nonceba Wimbley",
  lead: "Founder &amp; Chief Executive Officer of The Prestige Signature Standard Academy.",
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-12">
        <div class="min-[900px]:col-span-4 reveal">
          <p class="eyebrow">Founder story</p>
          <h2 class="section-title">Founder story</h2>
        </div>
        <div class="prose min-[900px]:col-span-8 reveal">
          <p>Nonceba Wimbley’s hospitality career began in Cape Town in late 2008. At 18, with no restaurant experience, she was hired on the spot at Ocean Basket. She went on to work as a waiter, bartender, hostess, assistant manager and Front of House Manager, in restaurants and at a game-reserve lodge.</p>
          <p>Working across cultures taught her that hospitality cannot be a script. A professional needs the standard, and the judgment to see the guest in front of them.</p>
          <p>She kept seeing the same gap: people were asked to deliver exceptional service without being shown what it looks like. The Academy exists to close that gap.</p>
        </div>
      </div>
    </section>

    <section class="bg-ink">
      <div class="grid min-[900px]:grid-cols-2">
        <div class="media-frame bleed-media">
          ${img("founder-standing", "Nonceba Wimbley, Founder and Chief Executive Officer, in a hospitality lobby.", { position: "center 10%", sizes: "(min-width: 900px) 50vw, 100vw" })}
        </div>
        <div class="founder-copy light-type reveal">
          <p class="eyebrow eyebrow-light">Founder philosophy</p>
          <ul class="rule-list">
            <li>Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.</li>
            <li>A guest should never feel ignored, uncomfortable, embarrassed, or like an inconvenience.</li>
            <li>A great service professional always pays attention, anticipates needs, communicates with confidence, and makes every guest feel important.</li>
            <li>The biggest mistake is expecting employees to deliver exceptional service without giving them the training, tools, support, and example they need to succeed.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section bg-ivory">
      <div class="wrap grid gap-8 min-[900px]:grid-cols-2">
        <article class="reveal">
          <h2 class="subhead">Mission</h2>
          <p class="lead mt-5">Give hospitality professionals the skill, presence and standards to create exceptional guest experiences, and help organizations build stronger teams.</p>
        </article>
        <article class="reveal">
          <h2 class="subhead">Vision</h2>
          <p class="lead mt-5">Establish the Prestige Signature Standard™ as a recognized standard of professional hospitality service.</p>
        </article>
      </div>
      <div class="wrap mt-12">
        <div class="media-frame reveal">
          ${img("founder-meeting", "Nonceba Wimbley in a discovery conversation with hospitality leaders.", { sizes: "(min-width: 900px) 80vw, 100vw" })}
        </div>
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. We start with discovery.",
  "Schedule a Discovery Consultation",
  "contact.html#discovery-form"
)}
`,
});

const contact = layout({
  file: "contact.html",
  title: "Schedule a Hospitality Training Discovery Consultation",
  description: "Tell Prestige where your team is today. Discovery comes before a training recommendation. Call 501-559-5118 or email nwimbley@prestigesignaturestandard.com.",
  path: "/contact.html",
  body: `
${heroBlock({
  page: true,
  image: "founder-meeting",
  alt: "Nonceba Wimbley in a discovery conversation with hospitality leaders.",
  kicker: "Discovery",
  title: "Let’s Talk About Your Service Experience.",
  titleClass: "compact",
  lead: "Where the team is today, and where service breaks down. Discovery comes before a recommendation.",
  actions: modalButton("Schedule a Discovery Consultation", "discovery", "btn-light"),
})}

    <section class="section bg-ivory" id="discovery">
      <div class="wrap grid gap-12 min-[1000px]:grid-cols-12">
        <div class="min-[1000px]:col-span-4 reveal">
          <h2 class="subhead">The Prestige Signature Standard Academy</h2>
          <div class="stack mt-6">
            <p>Bryant, Arkansas</p>
            <p><a href="tel:+15015595118">501-559-5118</a></p>
            <p><a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a></p>
            <p>PrestigeSignatureStandard.com</p>
          </div>
        </div>
        <div class="min-[1000px]:col-span-8 reveal">
          <h2 class="subhead">Begin with discovery</h2>
          <p class="lead mt-5">The form opens here. Nothing is sent yet. Call or email if you prefer.</p>
          <div class="actions">${modalButton("Schedule a Discovery Consultation", "discovery")}</div>
        </div>
      </div>
    </section>
`,
});

const enrollment = layout({
  file: "open-enrollment.html",
  title: "Open Enrollment | Prestige Signature Standard Academy",
  description: "Open enrollment interest list for Prestige hospitality training. No session dates are published until a class is officially scheduled. Per-person prices from $300.",
  path: "/open-enrollment.html",
  body: `
${heroBlock({
  page: true,
  image: "academy-training",
  alt: "Hospitality professionals practicing glassware, plate and service-tool standards.",
  kicker: "Open Enrollment",
  title: "Professional Development. The Prestige Standard.",
  lead: "No dates are set. Join the list and we will be in touch when a class is confirmed.",
  actions: modalButton("Join the Interest List", "enrollment", "btn-light"),
})}

    <section class="section bg-ivory" id="sessions">
      <div class="wrap grid gap-10 min-[900px]:grid-cols-2">
        <div class="reveal">
          <p class="eyebrow">Current state</p>
          <h2 class="section-title">Dates are announced only after a session is officially scheduled.</h2>
          <ul class="rule-list mt-8">
            <li>Standard class minimum: 8 paid participants.</li>
            <li>Standard class maximum: 25 participants.</li>
            <li>A date is not promised until the session is confirmed.</li>
          </ul>
        </div>
        <div class="reveal" data-session-list>
          <h2 class="subhead">Upcoming sessions</h2>
          <p class="lead mt-5">No sessions yet. Join the interest list to be contacted when a date is confirmed.</p>
          <div class="actions">${modalButton("Join the Interest List", "enrollment", "btn-ghost-ink")}</div>
        </div>
      </div>
    </section>

    <section class="section bg-cream">
      <div class="wrap reveal">
        <h2 class="section-title">Per-person pricing</h2>
        <table class="data-table mt-8">
          <thead>
            <tr><th scope="col">Program</th><th scope="col">Per person</th></tr>
          </thead>
          <tbody>
            <tr><td>Half-Day</td><td>$300</td></tr>
            <tr><td>Full-Day</td><td>$500</td></tr>
            <tr><td>Two-Day Signature Program</td><td>$900</td></tr>
            <tr><td>Five-Day Full Academy</td><td>$3,200</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section bg-ivory" id="interest">
      <div class="wrap reveal">
        <h2 class="subhead">Interest list</h2>
        <p class="lead mt-5">How to reach you, and which program you want. Nothing is sent yet.</p>
        <div class="actions">${modalButton("Join the Interest List", "enrollment")}</div>
      </div>
    </section>
`,
});

const missing = layout({
  file: "404.html",
  title: "Page Not Found | Prestige Signature Standard Academy",
  description: "The page you requested is not part of The Prestige Signature Standard Academy website.",
  path: "/404.html",
  body: `
    <section class="section bg-ivory">
      <div class="wrap">
        <p class="eyebrow">404</p>
        <h1 class="page-title">This page is not part of the academy site.</h1>
        <p class="lead mt-6">That address is not on this site.</p>
        <div class="actions">
          ${button("Home", "index.html")}
          ${button("Training Programs", "training-programs.html", "btn-ghost-ink")}
          ${modalButton("Schedule a Discovery Consultation", "discovery", "btn-ghost-ink")}
        </div>
      </div>
    </section>
`,
});

const pages = [
  ["index.html", home],
  ["training-programs.html", training],
  ["prestige-standard.html", standard],
  ["professional-credential.html", credential],
  ["who-we-serve.html", who],
  ["about.html", about],
  ["contact.html", contact],
  ["open-enrollment.html", enrollment],
  ["404.html", missing],
];

const root = process.cwd();
for (const [file, html] of pages) {
  await writeFile(path.join(root, file), html);
  console.log("wrote", file);
}
