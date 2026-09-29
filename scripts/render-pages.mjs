import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { bookingMarkup, trainingPaths } from './booking-markup.mjs';
import { PROGRAMS } from '../assets/js/programs.mjs';

const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>`;

const photos = JSON.parse(await readFile(new URL("../assets/images/optimized/manifest.json", import.meta.url), "utf8"));
const industryValues = ["Restaurant", "Hotel-Resort", "Golf-Country Club", "Private Club", "Event-Banquet", "Catering"];
const programValues = ["Half-Day", "Full-Day", "Two-Day", "Full Academy"];

const nav = [
  ["training-programs.html", "Training Programs"],
  ["prestige-standard.html", "The Prestige Standard"],
  ["professional-credential.html", "Professional Credential"],
  ["who-we-serve.html", "Who We Serve"],
  ["about.html", "About"],
  ["contact.html", "Contact"],
];

const menus = [
  {
    id: "programs",
    href: "training-programs.html",
    label: "Training Programs",
    overview: "All programs",
    lead: "Private cohorts of up to 25.",
    feature: ["training-programs.html", "hero-training", "A training session with hospitality professionals around a whiteboard.", "All programs", "Professional development for your team."],
    items: [
      ["training-programs.html#half-day", "Half-Day", "Focused skills and refresher training."],
      ["training-programs.html#full-day", "Full-Day", "A stronger service standard."],
      ["training-programs.html#two-day", "Two-Day Signature", "Technical and guest-experience development."],
      ["training-programs.html#full-academy", "Five-Day Full Academy", "Comprehensive development. Credential pathway."],
      ["private-training.html#booking", "Book private training", "Choose your program and training dates."],
      ["open-enrollment.html#booking", "Training for myself", "Individual professional development."],
      ["training-programs.html#curriculum", "Curriculum", "Fifteen modules, from presence to the capstone."],
    ],
  },
  {
    id: "standard",
    href: "prestige-standard.html",
    label: "The Prestige Standard",
    overview: "The standard",
    lead: "Presence, Observe, Initiate, Serve, Elevate.",
    feature: ["prestige-standard.html#poise", "coaching", "Practical coaching in plate presentation.", "P.O.I.S.E. Method™", "The sequence behind the guest experience."],
    items: [
      ["prestige-standard.html#standard-poise-0", "Presence", "Confidence and readiness before the first word."],
      ["prestige-standard.html#standard-poise-1", "Observe", "Read the guest, the table and the room."],
      ["prestige-standard.html#standard-poise-2", "Initiate", "Act before every need has to be stated."],
      ["prestige-standard.html#standard-poise-3", "Serve", "Technical and interpersonal precision."],
      ["prestige-standard.html#standard-poise-4", "Elevate", "Make correct service feel personal."],
      ["prestige-standard.html#method", "How we teach", "Demonstration, explanation, practice, assessment."],
      ["prestige-standard.html#client-standards", "Client SOP integration", "Your procedures, taught with the standard."],
    ],
  },
  {
    id: "credential",
    href: "professional-credential.html",
    label: "Professional Credential",
    overview: "The credential",
    lead: "Earned through the Five-Day Full Academy.",
    feature: ["professional-credential.html", "credential-moment", "A certificate presentation during a Prestige academy recognition moment.", "The credential", "Valid for two years."],
    items: [
      ["professional-credential.html#requirements", "Requirements", "90% attendance, 80% knowledge, 80% practical, Module 15."],
      ["professional-credential.html#certificate", "Certificate and credential", "A certificate confirms completion. The credential is earned."],
      ["professional-credential.html#renewal", "Validity and renewal", "Two years. Renewal from $650."],
      ["training-programs.html#full-academy", "Full Academy", "The pathway to the Professional Service Credential."],
    ],
  },
  {
    id: "serve",
    href: "who-we-serve.html",
    label: "Who We Serve",
    overview: "All sectors",
    lead: "Restaurants, hotels, clubs and event teams.",
    feature: ["who-we-serve.html", "fine-dining", "A server presenting plates to guests in a fine-dining room.", "All sectors", "Your standards stay in place."],
    items: [
      ["who-we-serve.html#restaurants", "Restaurants &amp; Fine Dining", "Presence, technique and table awareness."],
      ["who-we-serve.html#hotels", "Hotels &amp; Resorts", "Guest-facing service across the brand experience."],
      ["who-we-serve.html#golf", "Golf &amp; Country Clubs", "Members, guests, dining rooms and events."],
      ["who-we-serve.html#private-clubs", "Private Clubs", "Discretion, anticipation and consistency."],
      ["who-we-serve.html#events", "Event &amp; Banquet Venues", "Coordinated service in a fast room."],
      ["who-we-serve.html#catering", "Catering Teams", "The same standard across changing venues."],
    ],
  },
  {
    id: "about",
    href: "about.html",
    label: "About",
    overview: "Nonceba Wimbley",
    lead: "Nonceba Wimbley, Founder &amp; Chief Executive Officer.",
    feature: ["about.html#founder-story", "founder-portrait", "Portrait of Nonceba Wimbley, Founder and Chief Executive Officer.", "Founder story", "Cape Town, 2008, to the academy."],
    items: [
      ["about.html#founder-story", "Founder story", "From Ocean Basket in Cape Town to the academy."],
      ["about.html#philosophy", "Philosophy", "Welcomed, valued, respected and cared for."],
      ["about.html#mission", "Mission", "Skills, confidence, presence and a stronger service culture."],
      ["about.html#vision", "Vision", "A recognized standard of professional hospitality service."],
    ],
  },
  {
    id: "contact",
    href: "contact.html",
    label: "Contact",
    overview: "Academy contact",
    mark: ["open-enrollment.html"],
    lead: `Bryant, Arkansas · <a href="tel:+15015595118">501-559-5118</a>`,
    feature: ["open-enrollment.html", "academy-training", "Hospitality professionals practicing glassware, plate and service-tool standards.", "Open Enrollment", "Training begins November 2, 2026."],
    items: [
      ["contact.html#discovery-form", "Discovery consultation", "Tell us where your team is today.", "discovery"],
      ["open-enrollment.html", "Open Enrollment", "Choose your program. Develop your potential."],
      ["open-enrollment.html#pricing", "Per-person pricing", "Half-Day $300 through Full Academy $3,200."],
      ["open-enrollment.html#booking", "View available training", "Programs, dates and individual registration."],
    ],
  },
];

function img(name, alt, options = {}) {
  const photo = photos[name];
  const sizes = options.sizes || "(min-width: 900px) 50vw, 100vw";
  const srcset = photo.widths.map((w) => `assets/images/optimized/${name}-${w}.webp ${w}w`).join(", ");
  const largest = photo.widths[photo.widths.length - 1];
  const loading = options.eager ? `loading="eager" fetchpriority="high"` : `loading="lazy" decoding="async"`;
  const pos = options.position ? ` style="object-position:${options.position}"` : "";
  const cls = options.className ? ` class="${options.className}"` : "";
  return `<img src="assets/images/optimized/${name}-${largest}.webp" srcset="${srcset}" sizes="${sizes}" width="${photo.width}" height="${photo.height}" alt="${alt}"${cls} ${loading}${pos}>`;
}

function button(label, href, variant = "btn-ink") {
  return `<a class="btn ${variant}" href="${href}">${label}${arrow}</a>`;
}

function modalButton(label, modal, variant = "btn-ink", options = {}) {
  const mark = options.arrow === false ? "" : arrow;
  const preset = options.preset;
  const query = preset ? `?${new URLSearchParams({ [preset.field]: preset.value })}` : "";
  const href = modal === "discovery" ? `contact.html${query}#discovery-form` : `open-enrollment.html${query}#booking`;
  return `<a class="btn ${variant}" href="${href}"${modal === "discovery" ? ' data-open-modal="discovery"' : ''}>${label}${mark}</a>`;
}

function menuItem(item) {
  const [href, title, note, modal] = item;
  const opener = modal ? ` data-open-modal="${modal}"` : "";
  return `<a href="${href}"${opener}><strong>${title}</strong><span>${note}</span></a>`;
}

function menuFeature([href, image, alt, label, note]) {
  return `<a class="nav-feature" href="${href}">
    <span class="nav-feature-media">${img(image, alt, { className: "nav-feature-img", sizes: "(min-width: 1320px) 24vw, 80vw" })}</span>
    <span class="nav-feature-copy"><strong>${label}</strong><span>${note}</span></span>
  </a>`;
}

function header(activeFile) {
  const isCurrent = (menu) => menu.href === activeFile || (menu.mark || []).includes(activeFile);
  const desktop = menus.map((menu) => `<div class="nav-item" data-nav-item>
          <a class="nav-link" data-nav ${isCurrent(menu) ? 'aria-current="page"' : ""} href="${menu.href}">${menu.label}</a>
          <div class="nav-panel" id="nav-${menu.id}" role="region" aria-label="${menu.label}">
            <div class="nav-panel-inner">
              <div class="nav-panel-main">
                <p class="nav-panel-lead">${menu.lead}</p>
                <div class="nav-links">${menu.items.map(menuItem).join("")}</div>
              </div>
              ${menuFeature(menu.feature)}
            </div>
          </div>
        </div>`).join("\n        ");
  const mobile = menus.map((menu) => `<details class="mobile-group"${isCurrent(menu) ? " open" : ""}>
            <summary>${menu.label}</summary>
            <div class="mobile-sub">
              <a data-nav ${menu.href === activeFile ? 'aria-current="page"' : ""} href="${menu.href}">${menu.overview}</a>
              ${menu.items.map(menuItem).join("\n              ")}
            </div>
          </details>`).join("\n          ");
  return `<header class="site-header" data-header>
    <div class="header-inner">
      <a class="brand" href="index.html">
        <img src="assets/images/brand-master.jpg" width="1536" height="1024" alt="The Prestige Signature Standard Academy">
      </a>
      <nav class="desktop-nav" aria-label="Primary">
        ${desktop}
      </nav>
      <div class="header-tools">
        ${modalButton("Schedule a Discovery Consultation", "discovery", "btn-light header-cta", { arrow: false })}
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav">
          <span class="sr-only">Menu</span>
          <span class="nav-toggle-bars" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <div id="mobile-nav" class="mobile-nav" data-nav-panel>
      <nav aria-label="Mobile">
        ${modalButton("Schedule a Discovery Consultation", "discovery", "btn-light")}
        ${mobile}
      </nav>
    </div>
  </header>`;
}

function footer(activeFile) {
  const here = (href) => href === activeFile ? ' aria-current="page"' : "";
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-brand stack">
        <img src="assets/images/brand-master.jpg" width="1536" height="1024" alt="The Prestige Signature Standard Academy">
        <p>Professional Hospitality Service Training</p>
        <p>The Prestige Signature Standard™<br>P.O.I.S.E. Method™</p>
        <p>Bryant, Arkansas</p>
      </div>
      <nav class="footer-nav" aria-label="Academy">
        <p class="footer-label">Academy</p>
        <a${here("index.html")} href="index.html">Home</a>
        <a${here("prestige-standard.html")} href="prestige-standard.html">The Prestige Standard</a>
        <a${here("who-we-serve.html")} href="who-we-serve.html">Who We Serve</a>
        <a${here("about.html")} href="about.html">About</a>
        <a${here("contact.html")} href="contact.html">Contact</a>
      </nav>
      <nav class="footer-nav" aria-label="Training">
        <p class="footer-label">Training</p>
        <a${here("training-programs.html")} href="training-programs.html">Training Programs</a>
        <a${here("private-training.html")} href="private-training.html">Private Training Booking</a>
        <a href="training-programs.html#half-day">Half-Day</a>
        <a href="training-programs.html#full-day">Full-Day</a>
        <a href="training-programs.html#two-day">Two-Day Signature</a>
        <a href="training-programs.html#full-academy">Five-Day Full Academy</a>
        <a${here("professional-credential.html")} href="professional-credential.html">Professional Credential</a>
        <a${here("open-enrollment.html")} href="open-enrollment.html">Open Enrollment</a>
      </nav>
      <div class="footer-contact">
        <p class="footer-label">Contact</p>
        ${modalButton("Schedule a Discovery Consultation", "discovery", "footer-discovery")}
        <a href="tel:+15015595118">501-559-5118</a>
        <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>
        <p>Bryant, Arkansas</p>
      </div>
    </div>
    <div class="wrap footer-base">
      <p>&copy; <span data-year>2026</span> The Prestige Signature Standard Academy. All rights reserved.</p>
      <nav class="footer-legal" aria-label="Policies">
        <a${here("privacy.html")} href="privacy.html">Privacy</a>
        <a${here("terms.html")} href="terms.html">Terms</a>
        <a${here("accessibility.html")} href="accessibility.html">Accessibility</a>
      </nav>
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
  ${['booking-confirmation.html', '404.html', 'admin.html'].includes(file) ? '<meta name="robots" content="noindex, follow">' : ''}
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
  <link rel="preload" href="assets/fonts/cormorant-garamond-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "The Prestige Signature Standard Academy",
    "url": "https://prestigesignaturestandard.com/",
    "logo": "https://prestigesignaturestandard.com/assets/images/brand-master.jpg",
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
<body class="page-${file.replace(".html", "")}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(file)}
  <main id="main">
${body}
  </main>
  ${footer(file)}
  ${modals()}
  <script src="assets/js/main.js" defer></script>
  ${['open-enrollment.html', 'private-training.html', 'booking-confirmation.html'].includes(file) ? '<script type="module" src="assets/js/booking.mjs"></script>' : ''}
  ${file === 'admin.html' ? '<script type="module" src="assets/js/admin.mjs"></script>' : ''}
</body>
</html>
`;
}

function heroBlock({ image, alt, position = "center", kicker, title, lead, actions, page = false, titleClass = "", band = "" }) {
  return `    <section class="${page ? "page-hero" : "hero"}">
      <div class="hero-stage">
        <div class="hero-copy">
          ${kicker ? `<p class="eyebrow eyebrow-light">${kicker}</p>` : ""}
          <h1 class="${page ? "page-title" : "hero-title"}${titleClass ? " " + titleClass : ""}">${title}</h1>
          ${lead ? `<p class="lead">${lead}</p>` : ""}
          ${actions ? `<div class="hero-actions">${actions}</div>` : ""}
        </div>
        <div class="hero-visual">
          ${img(image, alt, { eager: true, sizes: page ? "(min-width: 900px) 55vw, 100vw" : "(max-width: 899px) 850px, 100vw", position, className: "hero-media" })}
        </div>
      </div>${band}
    </section>`;
}

function closing(title, copy, label, href) {
  return `    <section class="section closing-section bg-ink light-type">
      <div class="wrap reveal">
        <h2 class="section-title">${title}</h2>
        <p class="lead mt-6">${copy}</p>
        <div class="actions">${href === "contact.html#discovery-form" ? modalButton(label, "discovery", "btn-light") : button(label, href, "btn-light")}</div>
      </div>
    </section>`;
}

const programDescriptions = [
  "Focused skill gaps, refresher training or selected modules.",
  "Broader service reset or multi-module development.",
  "Deeper technical, behavioral and guest-experience development.",
  "Comprehensive service development and professional credential pathway.",
];
const programs = PROGRAMS.map((program, i) => [program.id, program.title, program.private.toLocaleString('en-US'), programDescriptions[i]]);

const modules = [
  [
    "Professional Presence & Appearance",
    "Professional image, grooming, posture, confidence and the way a service professional enters the guest experience."
  ],
  [
    "Tools of the Trade",
    "Understanding and professionally handling the tools used to deliver consistent service."
  ],
  [
    "Table & Place Setting",
    "Professional table setup, place settings and readiness standards."
  ],
  [
    "Plate Handling",
    "Safe, polished and controlled plate handling and service technique."
  ],
  [
    "Glassware",
    "Glassware recognition, handling, presentation and professional standards."
  ],
  [
    "Beverage Service",
    "Professional beverage presentation, handling and guest service technique."
  ],
  [
    "Bottle Service",
    "Physical bottle presentation, handling and pouring mechanics within Prestige’s service-training scope."
  ],
  [
    "The Guest Approach",
    "How to approach, greet and establish a professional guest relationship."
  ],
  [
    "Communication",
    "Clear, confident, respectful communication across different guests and situations."
  ],
  [
    "Reading the Table",
    "Observing cues, timing and guest behavior to determine when to act—and when not to interrupt."
  ],
  [
    "The Prestige Service Sequence",
    "A disciplined sequence that connects individual techniques into a polished service experience."
  ],
  [
    "Table Maintenance",
    "Maintaining cleanliness, order, readiness and guest comfort throughout the experience."
  ],
  [
    "Anticipating Guest Needs",
    "Moving from reactive service to thoughtful, proactive hospitality."
  ],
  [
    "Difficult Guests & Service Recovery",
    "Professional response, composure and recovery when the guest experience goes wrong."
  ],
  [
    "The Final Experience",
    "Integrated capstone applying the Prestige Signature Standard™ and P.O.I.S.E. Method™ in a realistic service experience."
  ]
];

const poise = [
  [
    "P",
    "Presence",
    "Present yourself with confidence, professionalism and readiness before the first word is spoken."
  ],
  [
    "O",
    "Observe",
    "Read the guest, table and environment. Notice what is happening before deciding what to do."
  ],
  [
    "I",
    "Initiate",
    "Act proactively and appropriately rather than waiting for every need to be stated."
  ],
  [
    "S",
    "Serve",
    "Execute the technical and interpersonal elements of service with precision and care."
  ],
  [
    "E",
    "Elevate",
    "Turn technically correct service into an experience that feels thoughtful, personal and memorable."
  ]
];

const sectors = [
  ["restaurants", "Restaurants &amp; Fine Dining", "Strengthen professional presence, technical service, table awareness, communication and consistency across the guest journey.", "fine-dining", "A server presenting plates to guests in a fine-dining room.", "center"],
  ["hotels", "Hotels &amp; Resorts", "Support polished guest-facing service across dining and hospitality environments where the brand experience matters.", "hospitality-professional", "A server carrying beverages along a resort pool terrace.", "center 30%"],
  ["golf", "Golf &amp; Country Clubs", "Develop consistent, attentive service for members, guests, dining rooms and special events.", "club-service", "A server carrying plates to guests on a club terrace beside a golf course.", "center 20%"],
  ["private-clubs", "Private Clubs", "Reinforce discretion, professionalism, anticipation and service standards in relationship-driven environments.", "service-team", "A uniformed service team standing together in a hotel lobby.", "center 15%"],
  ["events", "Event &amp; Banquet Venues", "Build coordinated service behavior, presentation and guest awareness in fast-moving event environments.", "place-setting", "A server finishing glassware and flowers on an outdoor banquet table.", "center"],
  ["catering", "Catering &amp; Event-Service Teams", "Strengthen portable service standards, team coordination and professional execution across changing venues.", "plate-service", "A server carrying a plated dish and service cloth through a dining room.", "center 20%"],
];

function poiseFeature(prefix) {
  const images = ["founder-portrait", "table-service", "coaching", "bottle-service", "fine-dining"];
  const alts = ["Nonceba Wimbley, Founder and Chief Executive Officer.", "A professional server attending to guests at their table.", "Practical coaching in plate presentation.", "A service professional presenting a bottle.", "Attentive service in a fine-dining room."];
  return `<div class="poise-explorer" data-poise>
    <div class="poise-controls" aria-label="Explore the five POISE stages">
      ${poise.map(([letter, word], i) => `<a href="#${prefix}-${i}" class="poise-step" data-poise-tab><span class="poise-letter">${letter}</span><span class="poise-word">${word}</span></a>`).join("")}
    </div>
    <div class="poise-panels">${poise.map(([letter, word, copy], i) => `<article class="poise-panel" id="${prefix}-${i}" data-poise-panel>
      <div class="poise-image">${img(images[i], alts[i], { position: i === 0 ? "center 24%" : "center 35%", sizes: "(min-width: 900px) 45vw, 100vw" })}</div>
      <div class="poise-description"><p class="eyebrow eyebrow-light">The P.O.I.S.E. Method™ · 0${i+1}</p><h3 class="section-title">${word}</h3><p class="lead">${copy}</p><span class="poise-index" aria-hidden="true">${letter}</span></div>
    </article>`).join("")}</div>
  </div>`;
}

function programRows(linked) {
  const images = ["place-setting", "coaching", "table-service", "hero-training"];
  const labels = ["Half a day", "One day", "Two days", "Five days"];
  return `<div class="program-collection${linked ? " program-rail" : ""}"${linked ? " data-rail" : ""}><div class="program-grid"${linked ? ' data-rail-track tabindex="0" role="region" aria-label="Flagship training programs"' : ""}>${programs.map(([id, name, price, copy], index) => `<article class="program-card" id="${id}">
    <div class="program-image">${img(images[index], `${name}: practical hospitality service training.`, { sizes: "(min-width: 1100px) 23vw, (min-width: 640px) 46vw, 100vw" })}<span class="program-duration">${labels[index]}</span></div>
    <div class="program-body"><p class="eyebrow">0${index+1} / Private training</p><h3 class="subhead">${name}</h3><p class="program-summary">${copy}</p><p class="cohort-note">Private cohorts · Up to 25 participants</p>
    ${linked ? button("Explore program", `training-programs.html#${id}`, "btn-ghost-ink") : `<details class="program-details"><summary>Explore this program<span aria-hidden="true">+</span></summary><div><p>${index === 3 ? "Comprehensive service development with the professional credential pathway. The credential is earned through the Full Academy assessment and performance requirements." : "Training can be customized around selected modules and your organization’s approved service procedures."}</p><p class="investment-note">Private training investment begins at $${price} per cohort.</p>${button("View training dates", `private-training.html?program=${id}#booking`, "btn-ink")}${modalButton("Discuss this program", "discovery", "btn-ghost-ink", { preset: { field: "training_interest", value: programValues[index] } })}</div></details>`}
    </div></article>`).join("")}</div>${linked ? `<div class="rail-controls"><span>Explore the programs</span><div><button type="button" data-rail-prev aria-label="Previous program">←</button><button type="button" data-rail-next aria-label="Next program">→</button></div></div>` : ""}</div>`;
}

function accordion() {
  return modules.map(([title, copy], index) => `<details class="accordion" id="module-${index+1}">
    <summary class="accordion-trigger"><span class="accordion-index">${String(index+1).padStart(2,"0")}</span><span>${title}</span><span class="accordion-icon" aria-hidden="true"></span></summary>
    <div class="accordion-panel"><p>${copy}</p></div>
  </details>`).join("");
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
          <div data-form-result></div>
          <p class="form-notice-reach">Call <a href="tel:+15015595118">501-559-5118</a> or email <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>.</p>
        </div>`;
}

function formMarkup(name, prefix) {
  const fields = `    <form action="#" method="post" novalidate data-inquiry-form>
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
        <button class="btn btn-ink" type="submit">Send My Inquiry${arrow}</button>
      </div>
      ${formNotice()}
    </form>`;
  return `<div class="form-intro"><p>Tell us about your team. Prestige will follow up about your training.</p><p>To speak with Prestige, <a href="tel:+15015595118">call 501-559-5118</a> or <a href="mailto:nwimbley@prestigesignaturestandard.com">email the Academy</a>.</p><p class="form-required">Fields marked * are required.</p></div>` + fields
    .replace('data-inquiry-form', `data-inquiry-form data-form-kind="${name}"`)
    .replaceAll('type="submit"', 'type="submit" disabled')
    .replaceAll('type="text"', 'type="text" maxlength="200"')
    .replaceAll('type="email"', 'type="email" maxlength="254"')
    .replaceAll('type="tel"', 'type="tel" maxlength="50"')
    .replace('<textarea ', '<textarea maxlength="1200" ')
    .replace(/(id|for|aria-describedby|data-error-for)="([^"]+)"/g, (_, attr, value) => `${attr}="${value.split(" ").map(id => `${prefix}-${id}`).join(" ")}"`);
}

function modals() {
  return [["discovery", "Schedule a Discovery Consultation"]].map(([name, title]) => `<dialog class="modal" id="${name}-dialog" data-modal="${name}" aria-labelledby="${name}-dialog-title">
    <div class="modal-panel"><div class="modal-toolbar"><p class="eyebrow">The Prestige Academy</p><button class="modal-close" type="button" data-close-modal aria-label="Close ${name} form">Close <span aria-hidden="true">×</span></button></div>
    <h2 id="${name}-dialog-title" class="subhead">${title}</h2>${formMarkup(name, `dialog-${name}`)}</div>
  </dialog>`).join("");
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
  title: "Create Experiences<br>Worth Remembering.",
  lead: "The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences.",
  actions: `${modalButton("Schedule a Discovery Consultation", "discovery", "btn-light")}${button("Explore Training Programs", "training-programs.html", "btn-text")}`,
  band: `
    <div class="hero-band">
      <ul class="capability-list">
        <li>Practical, hands-on service training</li>
        <li>Professional presence and etiquette</li>
        <li>Place settings and table readiness</li>
        <li>Guest communication and judgment</li>
        <li>Technical service execution</li>
        <li>Assessment and credential pathway</li>
      </ul>
    </div>`,
})}

    ${trainingPaths()}

    <section class="section difference-section bg-ivory" id="prestige-difference">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">The Prestige Difference</p>
          <h2 class="section-title title-wide">We don’t just train people to serve. We train professionals to create experiences worth remembering.</h2>
        </div>
        <div class="media-frame reveal">
          ${img("table-setting", "A formal place setting with gold flatware, white plates, a folded napkin, and glassware.", { position: "center 62%", sizes: "(min-width: 900px) 46vw, 100vw" })}
        </div>
      </div>
    </section>

    <section class="section bg-ink light-type">
      <div class="wrap reveal">
        <p class="eyebrow eyebrow-light">Powered by the P.O.I.S.E. Method™</p>
        <h2 class="section-title">The Prestige Signature Standard™</h2>
        ${poiseFeature("home-poise")}
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
            <p class="lead mt-6">Prestige training is designed around observable professional behavior. Participants see the skill, understand the reason, practice the technique and demonstrate what they can do.</p>
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
        <p class="lead mt-6">Build professional presence, practical skill and a consistent guest experience.</p>
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
          <h2 class="section-title title-wide">Meet Nonceba Wimbley</h2>
          <blockquote class="founder-quote mt-8">Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.</blockquote>
          <div class="actions">${button("Meet Our Founder", "about.html")}</div>
        </div>
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.",
  "Schedule a Discovery Consultation",
  "contact.html#discovery-form"
)}
`,
});

const training = layout({
  file: "training-programs.html",
  title: "Hospitality Training Programs | Prestige Signature Standard Academy",
  description: "Half-day, full-day, two-day and five-day hospitality training for private cohorts of up to 25. Professional development and the 15-module Prestige curriculum.",
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
  lead: "From focused skill development to the complete Prestige Full Academy, programs can be customized around the needs of the organization while preserving the Prestige professional service standard.",
})}

    <section class="section bg-ivory">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-12">
        <div class="min-[900px]:col-span-5 reveal">
          <p class="eyebrow">Training for your organization</p>
          <h2 class="section-title">Private cohorts of up to 25.</h2><div class="actions">${button("Explore Private Training", "private-training.html", "btn-ink")}</div>
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
        <h2 class="section-title">Four ways to elevate your service</h2>
        <p class="mt-6 max-w-3xl">Practical development, tailored to the needs of your team.</p>
        <div class="mt-8">
        ${programRows(false)}
        </div>
      </div>
    </section>

    <section class="section bg-ivory" id="curriculum">
      <div class="wrap grid gap-12 min-[1000px]:grid-cols-12">
        <div class="min-[1000px]:col-span-4 reveal">
          <p class="eyebrow">Curriculum</p>
          <h2 class="section-title">Curriculum</h2>
          <p class="mt-6">Public module names only. Lesson plans and rubrics stay with the instructor.</p>
          <div class="media-frame curriculum-photo mt-8">
            ${img("plate-service", "A server presenting a plated dish while holding a service cloth.", { position: "center 36%", sizes: "(min-width: 1000px) 32vw, 100vw" })}
          </div>
        </div>
        <div class="min-[1000px]:col-span-8 reveal">
        ${accordion()}
        </div>
      </div>
    </section>

${closing(
  "Request a custom training proposal",
  "Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.",
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
  image: "coaching",
  alt: "Practical coaching in plate presentation.",
  position: "center 34%",
  kicker: "The Prestige Signature Standard™",
  title: "Service Is More Than a Task. It Is a Standard.",
  lead: "The Prestige Signature Standard™ defines how a professional presents, observes, acts, serves and elevates the guest experience.",
})}

    <section class="section bg-ink light-type" id="poise">
      <div class="wrap reveal">
        <p class="eyebrow eyebrow-light">P.O.I.S.E. Method™</p>
        <h2 class="section-title sequence">Presence → Observe → Initiate → Serve → Elevate</h2>
        ${poiseFeature("standard-poise")}
      </div>
    </section>

    <section class="section bg-cream" id="method">
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

    <section class="section bg-ivory" id="client-standards">
      <div class="wrap grid gap-10 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">Client standards</p>
          <h2 class="section-title">Client SOP integration</h2>
          <p class="lead mt-6">Prestige teaches universal professional service standards. When working with an organization, approved client SOPs and brand requirements can be layered into the training so employees understand both the professional standard and how their employer expects it to be executed.</p>
        </div>
        <div class="media-frame reveal">
          ${img("training-room", "A Prestige training room prepared with glassware, place settings and service uniforms.", { sizes: "(min-width: 900px) 46vw, 100vw" })}
        </div>
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.",
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
  position: "center 20%",
  kicker: "Professional credential",
  title: "Prestige Signature Standard Professional Service Credential™",
  titleClass: "compact",
  lead: "A professional credential is earned through demonstrated knowledge, practical service skill and successful completion of the Five-Day Prestige Full Academy requirements.",
})}

    <section class="section bg-ivory" id="requirements">
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

    <section class="section bg-cream" id="certificate">
      <div class="wrap reveal">
        <h2 class="section-title title-wide">Certificate of Completion and the Professional Service Credential</h2>
        <div class="compare mt-8">
          <article>
            <h3 class="subhead">Certificate of Completion</h3>
            <p class="mt-4">Confirms participation or completion where applicable. It does not represent mastery of the Full Academy professional credential.</p>
          </article>
          <article class="compare-ink">
            <h3 class="subhead">Professional Service Credential</h3>
            <p class="mt-4">Earned only by satisfying the Full Academy assessment and performance requirements.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section bg-ivory" id="renewal">
      <div class="wrap reveal">
        <p class="eyebrow">Validity and renewal</p>
        <h2 class="section-title">Validity and renewal</h2>
        <p class="mt-6 max-w-3xl">The credential is valid for two years. A future registry will use unique credential numbers.</p>
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
        <div class="actions">${button("Full Academy for Myself", "open-enrollment.html?program=full-academy#booking", "btn-ink")}${button("Full Academy for My Team", "private-training.html?program=full-academy#booking", "btn-ghost-ink")}</div>
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
          <p class="lead mt-6">Prestige does not replace a client’s approved operating procedures. We teach the professional service foundation and, where appropriate, integrate the organization’s SOPs, brand expectations and service sequence into the learning experience.</p>
        </div>
        <div class="media-frame reveal">
          ${img("founder-meeting", "Nonceba Wimbley in a discovery conversation with hospitality leaders.", { sizes: "(min-width: 900px) 46vw, 100vw" })}
        </div>
      </div>
    </section>

    <nav class="sector-nav" aria-label="Hospitality sectors"><div class="wrap">${sectors.map(([id,title]) => `<a href="#${id}" data-sector-link>${title}</a>`).join("")}</div></nav>
    <section class="section bg-cream">
      <div class="wrap">
        ${sectors
          .map(([id, title, copy, image, alt, position], index) => `<article class="sector-row${index % 2 ? " reverse" : ""}" id="${id}">
          <div class="media-frame">${img(image, alt, { position, sizes: "(min-width: 900px) 52vw, 100vw" })}</div>
          <div class="sector-copy">
            <p class="eyebrow">0${index+1} / Who we serve</p><h2 class="section-title">${title}</h2>
            <p class="lead mt-5">${copy}</p><div class="actions">${modalButton("Schedule a Discovery Consultation", "discovery", "btn-ink", { preset: { field: "industry", value: industryValues[index] } })}</div>
          </div>
        </article>`)
          .join("\n        ")}
      </div>
    </section>

${closing(
  "Ready to elevate your service standard?",
  "Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.",
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

    <section class="section bg-ivory" id="founder-story">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-12">
        <div class="min-[900px]:col-span-4 reveal">
          <p class="eyebrow">Founder story</p>
          <h2 class="section-title">Founder story</h2>
        </div>
        <div class="prose min-[900px]:col-span-8 reveal">
          <p>Nonceba Wimbley’s hospitality journey began in Cape Town, South Africa, in late 2008, when she was 18 and straight out of high school. With no restaurant experience, she walked into Ocean Basket, sold herself on the opportunity and was hired on the spot.</p>
          <p>That opportunity became the beginning of a career in customer service and hospitality that has included work as a waiter, bartender, hostess, assistant manager and Front of House Manager, as well as experience in restaurants and a game-reserve lodge. Along the way, Nonceba trained and supervised employees, managed front-of-house operations and handled the moments that shape how guests remember an experience.</p>
          <p>Growing up and working in South Africa exposed her to different cultures, personalities, accents, beliefs, expectations and ways of communicating. It taught her that exceptional hospitality cannot be reduced to a script. A professional must know the standard—and also know how to see the individual guest in front of them.</p>
          <p>Prestige grew from something Nonceba kept noticing: employees were often expected to deliver exceptional service without ever being fully taught what exceptional service looks, sounds and feels like. Poor greetings. Incorrect glassware. Improper plate handling. Dirty tables left unattended. Staff talking or eating around guests. A lack of presence and awareness.</p>
          <p>The Prestige Signature Standard Academy was created to change that—to give hospitality professionals the training, tools, practice and confidence to become polished professionals who understand that service is not simply a transaction. It is an experience.</p>
        </div>
      </div>
    </section>

    <section class="bg-ink" id="philosophy">
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
        <article class="reveal" id="mission">
          <h2 class="subhead">Mission</h2>
          <p class="lead mt-5">The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences while helping organizations build stronger service cultures and better-prepared teams.</p>
        </article>
        <article class="reveal" id="vision">
          <h2 class="subhead">Vision</h2>
          <p class="lead mt-5">To establish the Prestige Signature Standard™ as a recognized standard of professional hospitality service and build an academy whose impact can be seen in stronger professionals, stronger businesses and unforgettable guest experiences.</p>
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
  "Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.",
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
  lead: "Tell us where your team is today, what you want guests to experience and where service feels inconsistent. Prestige begins with discovery before recommending a training solution.",
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
          <div id="discovery-form" class="inline-form">${formMarkup("discovery", "page-discovery")}</div>
        </div>
      </div>
    </section>
`,
});

const privateTraining = layout({
  file: "private-training.html", title: "Private Training Booking | Prestige Signature Standard Academy",
  description: "Choose customized hospitality training for your organization. Half-day through five-day programs, private cohorts and flexible payment options.", path: "/private-training.html",
  body: `${heroBlock({ page: true, image: "training-room", alt: "A Prestige training room prepared for practical hospitality service training.", kicker: "Training for your organization", title: "A Shared Standard.<br>A Stronger Team.", lead: "Customized, hands-on training that brings your people, your procedures and the Prestige standard together.", actions: button("Choose Your Program", "#booking", "btn-light") })}
  <section class="training-intro bg-cream"><div class="wrap"><p>Private cohorts of up to 25</p><p>Your procedures, integrated</p><p>Four formats. One Prestige standard.</p></div></section>
  ${bookingMarkup('private')}
  ${closing("Let’s shape the right program for your team.", "For customized requirements, multiple cohorts or guidance choosing a program, start a conversation with Prestige.", "Discuss Your Training", "contact.html#discovery-form")}`,
});

const enrollment = layout({
  file: "open-enrollment.html", title: "Open Enrollment | Prestige Signature Standard Academy",
  description: "Choose your individual hospitality training program and register securely. Four programs, from Half-Day to the Five-Day Full Academy.", path: "/open-enrollment.html",
  body: `${heroBlock({ page: true, image: "academy-training", position: "center 20%", alt: "Hospitality professionals practicing glassware, plate and service-tool standards.", kicker: "Training for yourself", title: "Your Ambition.<br>The Prestige Standard.", lead: "Build the presence, confidence and practical skills to create experiences worth remembering. Choose the professional development that is right for you.", actions: button("Choose Your Program", "#booking", "btn-light") })}
  <section class="training-intro bg-cream"><div class="wrap"><p>Training from November 2, 2026</p><p>Up to 25 participants per cohort</p><p>Individual registration</p></div></section>
  ${bookingMarkup('enrollment')}
  <section class="section bg-cream"><div class="wrap enrollment-explainer"><div><p class="eyebrow">Choose your own path</p><h2 class="section-title">The program you want.<br>The opportunity to grow.</h2></div><div><p>Choose the program that supports your professional goals. Select an available date, then complete payment. Prestige confirms the registration after payment is received.</p><p>Half-Day programs offer AM and PM sessions. Longer programs cover a complete training block. Each cohort welcomes up to 25 participants; Prestige confirms your session and registration arrangements directly.</p><a class="text-link" href="professional-credential.html">Explore the professional credential pathway →</a></div></div></section>`,
});

const bookingConfirmation = layout({
  file: "booking-confirmation.html", title: "Your Booking Status | Prestige Signature Standard Academy",
  description: "Check the payment and confirmation status of your Prestige training booking.", path: "/booking-confirmation.html",
  body: `<section class="section bg-ivory"><div class="wrap confirmation-wrap"><p class="eyebrow">Your Prestige experience</p><h1 class="page-title">Your booking status</h1><div class="confirmation-card" data-confirmation role="status"><h2 class="subhead">Check your confirmation</h2><p>Payment does not by itself confirm your training. Prestige confirms your place after payment is received. Contact the Academy if you need help with your registration.</p></div><div class="actions">${button("Open Enrollment", "open-enrollment.html", "btn-ink")}${button("Contact Prestige", "contact.html", "btn-ghost-ink")}</div></div></section>`,
});

const policyDate = "September 29, 2026";

function legalId(headingText) {
  return headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function legalPage({ file, title, description, kicker, heading, lead, sections }) {
  const related = [
    ["privacy.html", "Privacy"],
    ["terms.html", "Terms"],
    ["accessibility.html", "Accessibility"],
  ].filter(([href]) => href !== file);
  const items = sections.map(([headingText, copy]) => ({ id: legalId(headingText), headingText, copy }));
  return layout({
    file,
    title,
    description,
    path: `/${file}`,
    body: `
    <section class="section bg-ivory">
      <div class="wrap legal-wrap">
        <p class="eyebrow">${kicker}</p>
        <h1 class="page-title compact">${heading}</h1>
        <p class="lead mt-5">${lead}</p>
        <p class="legal-date">Updated ${policyDate}</p>
        <nav class="legal-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            ${items.map((item) => `<li><a href="#${item.id}">${item.headingText}</a></li>`).join("")}
          </ol>
        </nav>
        <div class="prose legal-prose">
          ${items.map((item) => `<h2 id="${item.id}">${item.headingText}</h2>${item.copy}`).join("\n          ")}
        </div>
        <div class="legal-contact">
          <p class="eyebrow">Contact the Academy</p>
          <p>The Prestige Signature Standard Academy</p>
          <p>Bryant, Arkansas</p>
          <p><a href="tel:+15015595118">501-559-5118</a></p>
          <p><a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a></p>
        </div>
        <nav class="legal-related" aria-label="Related policies">
          ${related.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
        </nav>
      </div>
    </section>
`,
  });
}

const privacy = legalPage({
  file: "privacy.html",
  title: "Privacy | Prestige Signature Standard Academy",
  description: "Privacy information for inquiries and training registration with The Prestige Signature Standard Academy.",
  kicker: "Privacy",
  heading: "Privacy",
  lead: "How Prestige handles the details you share when you inquire about training or register for a program.",
  sections: [
    ["Who this notice is for", `<p>The Prestige Signature Standard Academy operates this website from Bryant, Arkansas. This notice explains what Prestige does with the details you share when you ask about training or register for a program.</p>`],
    ["Information you share", `<p>A discovery inquiry asks for your name, company, title, email, phone, industry, the number of people to train, city and state, the program you are considering, your preferred timing, and a short note about your current service challenge. You confirm that Prestige may contact you about that inquiry.</p><p>A training registration asks for your name, email, and phone. Private training also asks for your organization and the reference on your approved training agreement. Open Enrollment may include your employer or role. Prestige records the program, dates, and session you select.</p>`],
    ["How Prestige uses it", `<p>Prestige uses these details to reply to your inquiry, hold the training date you requested, and confirm your place after payment is received. Prestige contacts you about the inquiry or registration you submitted.</p>`],
    ["Payment", `<p>Payment is completed on a secure payment page. This website does not ask for card details. A request holds the selected session for 16 hours. If Prestige has not confirmed it by then, the date becomes available again. Starting payment, or returning to this site, does not by itself confirm the training date.</p>`],
    ["What Prestige does not do", `<p>Prestige does not sell the information you provide. This website does not use advertising or analytics cookies. The details you submit are used to respond to your inquiry or registration.</p>`],
    ["How long it is kept", `<p>Prestige keeps inquiry and registration details for as long as they are needed to respond, deliver the training, and keep a record of that conversation or booking. You may ask about the information Prestige holds for you.</p>`],
    ["Your requests", `<p>You may ask Prestige to correct details you provided, or to discuss what the Academy has from your inquiry or registration. You can also call or email instead of using a form.</p>`],
    ["Children", `<p>Training is offered to working professionals and to organizations. This website is not directed at children, and Prestige does not knowingly collect information from children.</p>`],
    ["Changes to this notice", `<p>Prestige may update this page. The date above is the current version.</p>`],
  ],
});

const terms = legalPage({
  file: "terms.html",
  title: "Terms | Prestige Signature Standard Academy",
  description: "Terms for using The Prestige Signature Standard Academy website. A training engagement is confirmed separately.",
  kicker: "Terms",
  heading: "Terms",
  lead: "The terms for reading about the Academy, requesting a conversation, and registering for training.",
  sections: [
    ["About these terms", `<p>These terms apply when you use this website to learn about The Prestige Signature Standard Academy, request a discovery conversation, or register for training. A confirmed training engagement is the registration Prestige accepts after payment is received.</p>`],
    ["Inquiries", `<p>A discovery inquiry is a request for Prestige to contact you. It does not reserve a date or confirm a program. Prestige follows up about the training you describe.</p>`],
    ["Private training", `<p>Private programs serve cohorts of up to 25 participants. Choose the program, the available training dates, and either a 50% deposit or payment in full. A private request stays pending until Prestige confirms that payment was received and reviews the agreement reference.</p>`],
    ["Open Enrollment", `<p>Open Enrollment training availability begins November 2, 2026. Individuals choose their program and an available date or training block. The first confirmed registration establishes that program’s cohort for those dates.</p><p>Each cohort has a maximum of 25 participants. Registration closes at capacity, 48 hours before the session, or when Prestige closes the date.</p>`],
    ["Program investment", `<p>Approved private training starts at $3,750 for Half-Day, $6,000 for Full-Day, $10,000 for Two-Day and $35,000 for the Five-Day Full Academy. Open Enrollment is $300, $500, $900 and $3,200 per person respectively. All prices are in USD.</p>`],
    ["Payment and confirmation", `<p>Review your program, dates, and payment selection before you pay. A request holds a place for 16 hours. Payment does not by itself confirm registration. Prestige confirms your place after payment is received.</p><p>For a question about your training agreement, a cancellation, a new date, or a refund, contact Prestige. The Academy will discuss the request with you.</p>`],
    ["The credential", `<p>The Prestige Signature Standard Professional Service Credential™ is earned only by meeting the published Five-Day Full Academy requirements, including attendance, knowledge, practical assessment, and the Module 15 capstone. A certificate of completion is not that credential. The credential is valid for two years.</p>`],
    ["Names and materials", `<p>The Prestige Signature Standard™ and the P.O.I.S.E. Method™ name the Academy’s standard and teaching sequence. Text, photographs, and training descriptions on this site belong to the Academy and are here so you can learn about the programs. They are not a license to copy the curriculum or present it as someone else’s program.</p>`],
    ["Using the site", `<p>Use the site to read about the Academy and to request contact or registration. Do not disrupt the site, or submit another person’s information without permission to do so.</p>`],
    ["Changes to these terms", `<p>Prestige may update this page. The date above is the current version.</p>`],
  ],
});

const accessibility = legalPage({
  file: "accessibility.html",
  title: "Accessibility | Prestige Signature Standard Academy",
  description: "How to use The Prestige Signature Standard Academy website, and how to report a barrier.",
  kicker: "Accessibility",
  heading: "Accessibility",
  lead: "How to read about the Academy, inquire, and register, and how to tell Prestige if something gets in the way.",
  sections: [
    ["Our commitment", `<p>Prestige wants guests, leaders, and professionals to be able to read about the Academy, ask about training, and register for a program.</p>`],
    ["How the pages are arranged", `<p>Pages use headings, labeled form fields, and links that can be followed with a keyboard. Photographs include a written description. Training dates are named in words as well as shown on the calendar.</p><p>The discovery inquiry is available throughout the site. Separate pages guide organizations and individual participants.</p>`],
    ["Another way to inquire or register", `<p>If a form or a date selection cannot be completed, call or email the Academy. Prestige can take your inquiry and discuss your training needs with you.</p>`],
    ["Training arrangements", `<p>If a participant needs a particular arrangement in order to take part in training, say so when you inquire or register. The Academy will discuss what can be provided.</p>`],
    ["If something gets in the way", `<p>Email the Academy. Name the page and describe what got in the way. Prestige will review it and correct the page.</p>`],
  ],
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

const admin = layout({
  file: "admin.html",
  title: "Booking desk | Prestige Signature Standard Academy",
  description: "Private booking desk for confirming Prestige training payments.",
  path: "/admin.html",
  body: `    <section class="section bg-ivory admin-desk">
      <div class="wrap">
        <form class="admin-gate" data-admin-login>
          <p class="eyebrow">Academy desk</p>
          <h1 class="page-title">Booking desk</h1>
          <p class="lead">Sign in to confirm a payment, close a date, or add someone to the desk.</p>
          <div class="field"><label for="admin-email">Academy email</label><input id="admin-email" name="email" type="email" autocomplete="username" required></div>
          <div class="field"><label for="admin-password">Password</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required minlength="8"></div>
          <button class="btn btn-ink" type="submit">Sign in</button>
          <p class="admin-note" data-admin-login-status role="status" tabindex="-1"></p>
        </form>
        <div data-admin-app hidden>
          <div class="admin-bar">
            <div>
              <p class="eyebrow">Academy desk</p>
              <h1 class="page-title compact">Booking desk</h1>
            </div>
            <div class="admin-bar-user">
              <p data-admin-who></p>
              <button class="btn btn-ghost-ink" type="button" data-admin-signout>Sign out</button>
            </div>
          </div>
          <div class="admin-reminder" data-admin-reminder hidden>
            <p>This account is still using a starting password.</p>
            <button class="btn btn-ink" type="button" data-admin-reminder-go>Change it now</button>
          </div>
          <p class="admin-note" data-admin-status role="status" tabindex="-1"></p>
          <div class="admin-shell">
            <div class="admin-tabs" role="tablist" aria-label="Desk sections">
              <button type="button" role="tab" id="tab-bookings" aria-controls="panel-bookings" aria-selected="true" data-admin-tab="bookings">Bookings <span class="admin-count" data-admin-pending hidden></span></button>
              <button type="button" role="tab" id="tab-dates" aria-controls="panel-dates" aria-selected="false" tabindex="-1" data-admin-tab="dates">Dates</button>
              <button type="button" role="tab" id="tab-team" aria-controls="panel-team" aria-selected="false" tabindex="-1" data-admin-tab="team">Team</button>
              <button type="button" role="tab" id="tab-email" aria-controls="panel-email" aria-selected="false" tabindex="-1" data-admin-tab="email">Email</button>
              <button type="button" role="tab" id="tab-account" aria-controls="panel-account" aria-selected="false" tabindex="-1" data-admin-tab="account">Account</button>
            </div>
            <div class="admin-stage">
              <div role="tabpanel" id="panel-bookings" aria-labelledby="tab-bookings" data-admin-panel="bookings">
                <div class="admin-panel-head">
                  <h2 class="subhead">Bookings</h2>
                  <p data-admin-booking-copy>These requests are not confirmed yet. A pending date is held. An expired hold no longer blocks the date, and you can still confirm the payment if it arrived and the session is still open.</p>
                </div>
                <div class="admin-toolbar">
                  <div class="field admin-search">
                    <label for="booking-search">Find a booking</label>
                    <input id="booking-search" name="booking-search" type="search" data-admin-search autocomplete="off" placeholder="Name, email, or reference">
                  </div>
                  <div class="admin-filters" role="radiogroup" aria-label="Where a booking stands">
                    <button type="button" role="radio" aria-checked="true" data-admin-view="waiting">Waiting <span data-admin-count="waiting">0</span></button>
                    <button type="button" role="radio" aria-checked="false" data-admin-view="confirmed">Confirmed <span data-admin-count="confirmed">0</span></button>
                    <button type="button" role="radio" aria-checked="false" data-admin-view="released">Released <span data-admin-count="released">0</span></button>
                    <button type="button" role="radio" aria-checked="false" data-admin-view="all">All <span data-admin-count="all">0</span></button>
                  </div>
                </div>
                <div class="admin-list" data-admin-bookings></div>
              </div>
              <div role="tabpanel" id="panel-dates" aria-labelledby="tab-dates" data-admin-panel="dates" hidden>
                <div class="admin-panel-head">
                  <h2 class="subhead">Dates</h2>
                  <p>Weekdays from November 2, 2026 are listed below. A pending or confirmed booking holds that session. An expired hold leaves the date open.</p>
                </div>
                <div class="admin-schedule-head">
                  <button class="btn btn-ghost-ink" type="button" data-admin-month-prev>Previous month</button>
                  <h3 data-admin-month-label>November 2026</h3>
                  <button class="btn btn-ghost-ink" type="button" data-admin-month-next>Next month</button>
                </div>
                <div class="admin-schedule-wrap">
                  <table class="admin-schedule">
                    <caption>Training dates for <span data-admin-month-caption>November 2026</span></caption>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Morning</th>
                        <th scope="col">Afternoon</th>
                        <th scope="col">Full day</th>
                      </tr>
                    </thead>
                    <tbody data-admin-schedule></tbody>
                  </table>
                </div>
                <div class="admin-split">
                  <section class="admin-panel-box">
                    <h3>Hold length</h3>
                    <form class="admin-hold" data-admin-hold>
                      <div class="field"><label for="hold-hours">Hours a new request keeps the date</label><input id="hold-hours" name="hours" type="number" min="1" max="168" required value="16"></div>
                      <button class="btn btn-ink" type="submit">Save hold length</button>
                    </form>
                    <p class="booking-hint">A booking that is already pending keeps the time it was given.</p>
                  </section>
                  <section class="admin-panel-box">
                    <h3>Close a session</h3>
                    <form class="admin-close" data-admin-close>
                      <div class="field"><label for="close-date">Date</label><input id="close-date" name="date" type="date" required></div>
                      <div class="field"><label for="close-session">Session</label><select id="close-session" name="session"><option value="DAY">Full day</option><option value="AM">Morning</option><option value="PM">Afternoon</option></select></div>
                      <div class="field"><label for="close-note">Note</label><input id="close-note" name="note" maxlength="160"></div>
                      <button class="btn btn-ink" type="submit">Close this date</button>
                    </form>
                  </section>
                </div>
                <h3 class="admin-sub">Closed</h3>
                <div class="admin-panel-box" data-admin-closures></div>
              </div>
              <div role="tabpanel" id="panel-team" aria-labelledby="tab-team" data-admin-panel="team" hidden>
                <div class="admin-panel-head">
                  <h2 class="subhead">Team</h2>
                  <p>Add an academy email. The starting password is shown once, and that person is reminded to replace it.</p>
                </div>
                <section class="admin-panel-box">
                  <h3>New admin</h3>
                  <form class="admin-hold" data-admin-create>
                    <div class="field"><label for="new-admin-email">Academy email</label><input id="new-admin-email" name="email" type="email" autocomplete="off" required></div>
                    <button class="btn btn-ink" type="submit">Create admin</button>
                  </form>
                </section>
                <div class="admin-issued" data-admin-issued hidden></div>
                <h3 class="admin-sub">Admins</h3>
                <div class="admin-panel-box" data-admin-team></div>
              </div>
              <div role="tabpanel" id="panel-email" aria-labelledby="tab-email" data-admin-panel="email" hidden>
                <div class="admin-panel-head"><h2 class="subhead">Email</h2><p>Website inquiries are stored securely and sent to this academy inbox.</p></div>
                <p class="admin-note" data-email-status role="status"></p>
                <form data-email-settings class="admin-panel-box"><fieldset disabled><legend>Inquiry notifications</legend>
                  <div class="field"><label for="email-notification">Admin email address</label><input id="email-notification" name="notification_to" type="email" required maxlength="254" aria-describedby="email-help"><p id="email-help">Inquiries, open enrollment, and payments are sent here. When changing this address, activate the new inbox from its confirmation email. Guests receive an on-screen confirmation.</p></div>
                  <button class="btn btn-ink" type="submit">Save email address</button>
                </fieldset></form>
                <section class="admin-panel-box"><h3>Inquiries</h3><p class="admin-empty">Each website inquiry is sent to the inbox above and kept here. Delete one when you no longer need it.</p><button class="btn btn-ghost-ink" data-email-refresh type="button">Refresh inquiries</button><div class="inquiry-list" data-email-log></div></section>
              </div>
              <div role="tabpanel" id="panel-account" aria-labelledby="tab-account" data-admin-panel="account" hidden>
                <div class="admin-panel-head">
                  <h2 class="subhead">Account</h2>
                  <p>Replace the password for the email you used to sign in. Use at least 8 characters.</p>
                </div>
                <section class="admin-panel-box admin-account">
                  <h3>New password</h3>
                  <form class="admin-hold" data-admin-password>
                    <div class="field"><label for="new-password">New password</label><input id="new-password" name="password" type="password" autocomplete="new-password" required minlength="8"></div>
                    <button class="btn btn-ink" type="submit">Save password</button>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
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
  ["private-training.html", privateTraining],
  ["booking-confirmation.html", bookingConfirmation],
  ["privacy.html", privacy],
  ["terms.html", terms],
  ["accessibility.html", accessibility],
  ["404.html", missing],
  ["admin.html", admin],
];

const root = process.cwd();
for (const [file, html] of pages) {
  await writeFile(path.join(root, file), html.replace(/[ \t]+$/gm, ""));
  console.log("wrote", file);
}
