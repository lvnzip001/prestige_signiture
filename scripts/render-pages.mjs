import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
    feature: ["training-programs.html", "hero-training", "A training session with hospitality professionals around a whiteboard.", "All programs", "Starting prices, per cohort."],
    items: [
      ["training-programs.html#half-day", "Half-Day", "Starting at $3,750."],
      ["training-programs.html#full-day", "Full-Day", "Starting at $6,000."],
      ["training-programs.html#two-day", "Two-Day Signature", "Starting at $10,000."],
      ["training-programs.html#full-academy", "Five-Day Full Academy", "Starting at $35,000. Credential pathway."],
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
    feature: ["open-enrollment.html", "academy-training", "Hospitality professionals practicing glassware, plate and service-tool standards.", "Open Enrollment", "Dates are announced only after a session is scheduled."],
    items: [
      ["contact.html#discovery-form", "Discovery consultation", "Tell us where your team is today.", "discovery"],
      ["open-enrollment.html", "Open Enrollment", "Per person, once a class is confirmed. From $300."],
      ["open-enrollment.html#pricing", "Per-person pricing", "Half-Day $300 through Full Academy $3,200."],
      ["open-enrollment.html#interest-form", "Interest list", "Be contacted when a session is scheduled.", "enrollment"],
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
  const href = modal === "discovery" ? `contact.html${query}#discovery-form` : `open-enrollment.html${query}#interest-form`;
  return `<a class="btn ${variant}" href="${href}" data-open-modal="${modal}">${label}${mark}</a>`;
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
        <img src="assets/images/optimized/logo.webp" width="${photos.logo.width}" height="${photos.logo.height}" alt="The Prestige Signature Standard Academy">
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
        <img src="assets/images/optimized/logo.webp" width="${photos.logo.width}" height="${photos.logo.height}" alt="The Prestige Signature Standard Academy">
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
<body class="page-${file.replace(".html", "")}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(file)}
  <main id="main">
${body}
  </main>
  ${footer(file)}
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
          ${img(image, alt, { eager: true, sizes: page ? "(min-width: 900px) 55vw, 100vw" : "(max-width: 899px) 850px, 100vw", position, className: "hero-media" })}
        </div>
      </div>
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

const programs = [
  ["half-day", "Half-Day Customized Training", "3,750", "Focused skill gaps, refresher training or selected modules."],
  ["full-day", "Full-Day Customized Training", "6,000", "Broader service reset or multi-module development."],
  ["two-day", "Two-Day Signature Program", "10,000", "Deeper technical, behavioral and guest-experience development."],
  ["full-academy", "Five-Day Prestige Full Academy", "35,000", "Comprehensive service development and professional credential pathway."],
];

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
    <div class="program-body"><p class="eyebrow">0${index+1} / Private training</p><h3 class="subhead">${name}</h3><p class="program-summary">${copy}</p><p class="price"><small>Starting at</small>$${price}</p><p class="cohort-note">Per cohort · Up to 25 participants</p>
    ${linked ? button("Explore program", `training-programs.html#${id}`, "btn-ghost-ink") : `<details class="program-details"><summary>Explore this program<span aria-hidden="true">+</span></summary><div><p>${index === 3 ? "Comprehensive service development with the professional credential pathway. The credential is earned through the Full Academy assessment and performance requirements." : "Training can be customized around selected modules and your organization’s approved service procedures. Prestige begins with discovery before recommending a program."}</p>${modalButton("Discuss this program", "discovery", "btn-ink", { preset: { field: "training_interest", value: programValues[index] } })}</div></details>`}
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
          <p><strong>Online submission is being connected.</strong> This form did not send your inquiry.</p>
          <p class="mt-3">Call <a href="tel:+15015595118">501-559-5118</a> or email <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>.</p>
        </div>`;
}

function formMarkup(name, prefix) {
  const fields = name === "discovery" ? `    <form action="#" method="post" novalidate data-phase1-form>
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
    </form>` : `    <form action="#" method="post" novalidate data-phase1-form>
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
    </form>`;
  return `<div class="form-intro"><p>Online submission is being connected. This form will not send your details.</p><p>To speak with Prestige, <a href="tel:+15015595118">call 501-559-5118</a> or <a href="mailto:nwimbley@prestigesignaturestandard.com">email the Academy</a>.</p><p class="form-required">Fields marked * are required.</p></div>` + fields
    .replace('data-phase1-form', `data-phase1-form data-form-kind="${name}"`)
    .replaceAll('type="submit"', 'type="submit" disabled')
    .replace(/(id|for|aria-describedby|data-error-for)="([^"]+)"/g, (_, attr, value) => `${attr}="${value.split(" ").map(id => `${prefix}-${id}`).join(" ")}"`);
}

function modals() {
  return [["discovery", "Schedule a Discovery Consultation"], ["enrollment", "Join the Interest List"]].map(([name, title]) => `<dialog class="modal" id="${name}-dialog" data-modal="${name}" aria-labelledby="${name}-dialog-title">
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
})}

    <section class="section difference-section bg-ivory" id="prestige-difference">
      <div class="wrap grid gap-12 min-[900px]:grid-cols-2 min-[900px]:items-center">
        <div class="reveal">
          <p class="eyebrow">The Prestige Difference</p>
          <h2 class="section-title title-wide">We don’t just train people to serve. We train professionals to create experiences worth remembering.</h2>
          <div class="media-frame mt-8">
            ${img("table-setting", "A formal place setting with gold flatware, white plates, a folded napkin, and glassware.", { position: "center 62%", sizes: "(min-width: 900px) 46vw, 100vw" })}
          </div>
        </div>
        <ul class="capability-list reveal">
          <li>Practical, hands-on service training</li>
          <li>Professional presence and etiquette</li>
          <li>Place settings and table readiness</li>
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
  lead: "From focused skill development to the complete Prestige Full Academy, programs can be customized around the needs of the organization while preserving the Prestige professional service standard.",
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

const enrollment = layout({
  file: "open-enrollment.html",
  title: "Open Enrollment | Prestige Signature Standard Academy",
  description: "Open enrollment interest list for Prestige hospitality training. No session dates are published until a class is officially scheduled. Per-person prices from $300.",
  path: "/open-enrollment.html",
  body: `
${heroBlock({
  page: true,
  image: "academy-training",
  position: "center 20%",
  alt: "Hospitality professionals practicing glassware, plate and service-tool standards.",
  kicker: "Open Enrollment",
  title: "Professional Development. The Prestige Standard.",
  lead: "Register your interest in professional hospitality training. Session dates are announced once officially scheduled.",
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
          <p class="lead mt-5">No sessions are currently scheduled. Contact Prestige to express your interest in a future class.</p>
          <div class="actions">${modalButton("Join the Interest List", "enrollment", "btn-ghost-ink")}</div>
        </div>
      </div>
    </section>

    <section class="section bg-cream" id="pricing">
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
        <div id="interest-form" class="inline-form">${formMarkup("enrollment", "page-enrollment")}</div>
      </div>
    </section>
`,
});

const policyDate = "September 24, 2026";

function legalPage({ file, title, description, kicker, heading, lead, sections }) {
  const related = [
    ["privacy.html", "Privacy"],
    ["terms.html", "Terms"],
    ["accessibility.html", "Accessibility"],
  ].filter(([href]) => href !== file);
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
        <p class="legal-date">${policyDate}</p>
        <div class="prose legal-prose">
          ${sections.map(([headingText, copy]) => `<h2>${headingText}</h2>${copy}`).join("\n          ")}
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
  description: "How The Prestige Signature Standard Academy website handles inquiries. Forms on this site do not send yet.",
  kicker: "Privacy",
  heading: "Privacy",
  lead: "This page describes what this website collects, and what it does not.",
  sections: [
    ["Who operates this site", `<p>The Prestige Signature Standard Academy operates this website from Bryant, Arkansas. Questions about privacy can go to <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a> or <a href="tel:+15015595118">501-559-5118</a>.</p>`],
    ["What the forms ask for", `<p>The discovery form asks for name, company, title, email, phone, industry, number of people to train, city and state, training interest, desired timing, and an optional note about the current service challenge. It also asks for permission to be contacted about that inquiry.</p><p>The open-enrollment interest form asks for name, email, phone, city and state, employer or role, program interest, preferred timeframe, and agreement to be contacted about open enrollment.</p><p>Each form includes a hidden field used to filter automated submissions, and may record which page the form was opened from.</p>`],
    ["Forms on this website do not send yet", `<p>Online submission is still being connected. Completing a form on this website does not send the inquiry and does not store it with the academy. To reach Prestige now, call or email.</p>`],
    ["If submission is connected later", `<p>Information from a discovery inquiry would be used to reply and to discuss training. Information from the interest list would be used to contact that person about a future class. Prestige does not sell personal information and does not use it for unrelated advertising.</p>`],
    ["What this site does not do", `<p>This website has no accounts, no online checkout, and no card payment. It does not use advertising or analytics cookies. Fonts are served from this website.</p><p>The service that hosts the site may keep ordinary connection records, such as an IP address, browser type, and the page requested, in order to operate and protect the site.</p>`],
    ["Children", `<p>This website is for hospitality organizations and professionals. It is not directed to children, and the academy does not knowingly collect information from children.</p>`],
  ],
});

const terms = legalPage({
  file: "terms.html",
  title: "Terms | Prestige Signature Standard Academy",
  description: "Terms for using The Prestige Signature Standard Academy website. A training engagement is confirmed separately.",
  kicker: "Terms",
  heading: "Terms",
  lead: "These terms cover use of this website. A training engagement is confirmed separately.",
  sections: [
    ["The website is not a booking", `<p>The pages describe professional hospitality service training. Sending a discovery inquiry or joining the interest list is a request for contact. It does not reserve a date, confirm a cohort, or create a training agreement.</p><p>Open enrollment dates are announced only after a session is officially scheduled. A standard class needs at least 8 paid participants and holds no more than 25.</p>`],
    ["Prices", `<p>Private training is priced per cohort of up to 25 participants. The starting prices are on the <a href="training-programs.html">Training Programs</a> page. A customized program is discussed after discovery.</p><p>Open enrollment is priced per person. Those prices are on the <a href="open-enrollment.html#pricing">Open Enrollment</a> page. This website does not take payment.</p><p>Credential renewal fees are on the <a href="professional-credential.html#renewal">Professional Credential</a> page.</p>`],
    ["The credential", `<p>The Prestige Signature Standard Professional Service Credential™ is earned only by meeting the published Five-Day Full Academy requirements, including attendance, knowledge, practical assessment, and the Module 15 capstone. A certificate of completion is not that credential. The credential is valid for two years.</p>`],
    ["Names and materials", `<p>The Prestige Signature Standard™ and the P.O.I.S.E. Method™ name the academy’s standard and teaching sequence. Text, photographs, and training descriptions on this site are for learning about the academy. They are not a license to copy the curriculum or present it as someone else’s program.</p>`],
    ["Using the site", `<p>Use the site to read about the academy and to request contact. Do not attempt to disrupt the site, or submit another person’s information without permission to do so.</p><p>Prestige may update these pages. The date at the top is the current version. Questions can go to <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>.</p>`],
  ],
});

const accessibility = legalPage({
  file: "accessibility.html",
  title: "Accessibility | Prestige Signature Standard Academy",
  description: "How to use The Prestige Signature Standard Academy website, and how to report a barrier.",
  kicker: "Accessibility",
  heading: "Accessibility",
  lead: "The academy site is built so the training information can be read, reached, and used.",
  sections: [
    ["How the pages are built", `<p>Pages use headings, labeled form fields, and links that can be followed with a keyboard. The discovery form and the interest form can be opened from any page. Menus can be opened with a keyboard, and Escape closes the desktop menu.</p>`],
    ["A form on this site does not send", `<p>Online submission is still being connected. If a form cannot be completed, call <a href="tel:+15015595118">501-559-5118</a> or email <a href="mailto:nwimbley@prestigesignaturestandard.com">nwimbley@prestigesignaturestandard.com</a>. Those are the working ways to reach the academy.</p>`],
    ["If something blocks you", `<p>Email the academy, name the page, and describe what got in the way. Prestige will use that to correct the page.</p>`],
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

const pages = [
  ["index.html", home],
  ["training-programs.html", training],
  ["prestige-standard.html", standard],
  ["professional-credential.html", credential],
  ["who-we-serve.html", who],
  ["about.html", about],
  ["contact.html", contact],
  ["open-enrollment.html", enrollment],
  ["privacy.html", privacy],
  ["terms.html", terms],
  ["accessibility.html", accessibility],
  ["404.html", missing],
];

const root = process.cwd();
for (const [file, html] of pages) {
  await writeFile(path.join(root, file), html.replace(/[ \t]+$/gm, ""));
  console.log("wrote", file);
}
