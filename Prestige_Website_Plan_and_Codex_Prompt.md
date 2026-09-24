# Prestige Signature Standard Academy
## Website Plan, Full Mapping & Codex Build Prompt

Prepared from the supplied client package:
- `Prestige_FINAL_Website_Design_and_Development_Blueprint_v1.docx`
- `Prestige_Signature_Standard_Academy_Final_Website_Blueprint.docx`
- `Prestige_Website_Strategy.docx`
- supplied logo, founder, hospitality and training images
- supplied website mockups
- supplied PolarPro HAR capture
- current PolarPro website design reference: https://www.polarpro.com/

---

# 1. Executive Build Direction

Build a premium, image-led, multi-page static website for **The Prestige Signature Standard Academy** using:

- semantic HTML5
- vanilla JavaScript
- Tailwind CSS as the primary styling system
- limited custom CSS where Tailwind alone is not the cleanest solution
- no React, Vue, Angular, WordPress or other application framework
- no backend in Phase 1
- no real form submission in Phase 1
- Supabase integration reserved for Phase 2

The finished site must feel like a premium hospitality brand and executive training academy, not a generic course provider, restaurant template or local training company.

The visual reference is **PolarPro**, but this is inspiration rather than a clone. Translate the useful PolarPro qualities into the Prestige brand:

- large, confident editorial typography
- strong full-width imagery
- cinematic image crops
- generous negative space
- premium black/light section contrast
- minimal navigation chrome
- strong hierarchy
- modern pill/rounded calls to action
- restrained card radii
- fluid responsive typography
- subtle hover/reveal motion
- clean grid-based layouts
- strong visual merchandising of content
- highly intentional mobile presentation

Do **not** copy PolarPro's content, assets, ecommerce UI, exact components or page structure.

Prestige has its own locked visual direction:
- luxury hospitality
- executive/professional training
- international sophistication
- black + champagne gold + ivory/cream
- elegant serif display typography
- clean modern sans-serif body/UI typography

---

# 2. Source-of-Truth Hierarchy

There are conflicts between the three client documents. Use this hierarchy.

## Priority 1 — Controlling source
`Prestige_FINAL_Website_Design_and_Development_Blueprint_v1.docx`

This document explicitly states that it is the **controlling website direction**. It governs:
- site architecture
- navigation
- approved public copy
- pricing
- credential information
- contact information
- functionality
- SEO
- legal/brand restrictions
- open-enrollment state

## Priority 2 — Supporting source
`Prestige_Website_Strategy.docx`

Use only where it adds detail that does not conflict with the controlling blueprint.

## Priority 3 — Older supporting source
`Prestige_Signature_Standard_Academy_Final_Website_Blueprint.docx`

Use only where it does not conflict with the controlling blueprint.

## Visual references only
- `website_template1.jpg`
- `website_template_2.jpg`
- PolarPro reference

The mockups are **not content authority**. They contain older wording and at least one founder-name inconsistency.

### Specific conflict resolutions

Use:
- **Nonceba Wimbley**, never "Natasha Wimbley".
- **Founder & Chief Executive Officer**, not "Founder & Lead Trainer" where the title is shown publicly.
- primary sitewide CTA: **Schedule a Discovery Consultation**
- controlling navigation from the final blueprint
- hero direction from the controlling blueprint:
  - eyebrow: **PROFESSIONAL HOSPITALITY SERVICE TRAINING**
  - H1: **Create Experiences Worth Remembering.**
- controlling pages include **Professional Credential**, **Who We Serve**, and **Open Enrollment**.
- do **not** build `Online Academy`, `Resources`, or the older `For Businesses` architecture in Phase 1 unless the client later re-approves them.
- do not make "Elevating People. Enhancing Experiences. Creating Opportunities." the homepage primary headline because that comes from the older direction.
- do not invent any testimonials, customer counts, client logos, certifications, accreditations, awards, partnerships, measured results or statistics.

---

# 3. Brand Facts That Must Remain Exact

| Item | Approved information |
|---|---|
| Company | The Prestige Signature Standard Academy |
| Category | Professional Hospitality Service Training |
| Founder & CEO | Nonceba Wimbley |
| Domain | PrestigeSignatureStandard.com |
| Email | nwimbley@prestigesignaturestandard.com |
| Phone display | 501-559-5118 |
| Phone link | tel:+15015595118 |
| Location | Bryant, Arkansas |
| PO Box | Do not show until the actual PO Box number is supplied |
| Signature standard | The Prestige Signature Standard™ |
| Method | P.O.I.S.E. Method™ |
| POISE sequence | Presence → Observe → Initiate → Serve → Elevate |
| Learning model | Demonstration → Explanation → Practice → Assessment |
| Primary positioning | We don’t just train people to serve. We train professionals to create experiences worth remembering. |
| Primary CTA | Schedule a Discovery Consultation |

Never publish a fictitious street address.

---

# 4. Approved Colour System

Create these as CSS custom properties and map them into Tailwind utilities/tokens.

```css
--prestige-black: #171512;
--prestige-gold: #B08D57;
--prestige-deep-gold: #806333;
--prestige-ivory: #F4EFE5;
--prestige-cream: #E8DFD0;
--prestige-charcoal: #49453F;
--prestige-white: #FFFFFF;
```

Recommended usage:
- black: hero backgrounds, footer, high-authority sections
- gold: CTA accents, rules, eyebrow copy, active states, icon details
- deep gold: hover/darker accents
- ivory: primary light page canvas
- warm cream: alternating light sections/cards
- charcoal: long-form body copy
- white: text over dark/photo sections

Avoid:
- excessive gold gradients
- metallic visual effects everywhere
- gold text on busy images without sufficient contrast
- cheap "luxury" styling
- glossy button effects
- template-looking black-and-gold ornamentation

The brand should feel refined, not decorative.

---

# 5. Typography Direction

The documents require an elegant serif for major headings and a modern sans-serif for UI/body text.

Recommended working pair:
- display/headings: **Cormorant Garamond**
- body/UI: **Manrope**

If those fonts are not already locally available, it is acceptable during development to use a reputable web-font source or open-license local files. Do not bundle unlicensed commercial fonts. If the client later supplies official typefaces, the system must be easy to swap.

Fallbacks:

```css
font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
font-family: "Manrope", Inter, Arial, sans-serif;
```

Typography principles adapted from the PolarPro reference:
- very large fluid hero heading
- compact line-height on display headings
- uppercase, widely tracked eyebrow text
- concise copy blocks
- body measure around 60–72 characters where practical
- strong contrast between display and body sizing
- no excessive font-weight variations
- never use decorative script for paragraphs or UI

Suggested scale:
- hero H1: `clamp(3.25rem, 7vw, 7rem)`
- page H1: `clamp(2.75rem, 5vw, 5.75rem)`
- section H2: `clamp(2.25rem, 4vw, 4.25rem)`
- H3: `clamp(1.5rem, 2vw, 2.25rem)`
- body lead: `clamp(1.05rem, 1.4vw, 1.3rem)`
- body: `1rem–1.125rem`
- eyebrow: `0.7rem–0.8rem`, uppercase, `0.14em–0.2em` tracking

---

# 6. Site Architecture

Phase 1 routes:

```text
/
├── index.html
├── training-programs.html
├── prestige-standard.html
├── professional-credential.html
├── who-we-serve.html
├── about.html
├── contact.html
├── open-enrollment.html
└── 404.html
```

Do not publicly expose placeholder Privacy/Terms copy that has not been legally approved. Footer link slots may be prepared in markup/comments but should remain hidden until content is supplied.

Recommended technical structure:

```text
/
├── index.html
├── training-programs.html
├── prestige-standard.html
├── professional-credential.html
├── who-we-serve.html
├── about.html
├── contact.html
├── open-enrollment.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── input.css
│   │   └── site.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   │   ├── originals/
│   │   └── optimized/
│   └── icons/
├── docs/
│   └── PHASE_2_SUPABASE.md
├── package.json
├── .gitignore
└── README.md
```

Adjust this structure to the existing project only where necessary. Do not destroy a working build setup simply to match this example.

---

# 7. Header / Global Navigation Mapping

Desktop navigation:

1. logo → `index.html`
2. Training Programs → `training-programs.html`
3. The Prestige Standard → `prestige-standard.html`
4. Professional Credential → `professional-credential.html`
5. Who We Serve → `who-we-serve.html`
6. About → `about.html`
7. Contact → `contact.html`
8. OPEN ENROLLMENT → `open-enrollment.html`
9. sitewide primary CTA → `contact.html#discovery-form`

Design:
- sticky header
- black or near-black base
- subtle border/rule
- logo left
- nav center/right
- Discovery CTA visually strongest
- Open Enrollment should retain a gold-accent treatment
- use a compact mobile hamburger menu
- on mobile, both Open Enrollment and Schedule a Discovery Consultation must remain easy to reach

At intermediate tablet/laptop widths, collapse to the mobile/compact navigation before the header becomes cramped.

---

# 8. Footer Mapping

Include:
- official logo/academy identity
- "Professional Hospitality Service Training"
- all primary navigation links
- Schedule a Discovery Consultation
- 501-559-5118
- nwimbley@prestigesignaturestandard.com
- Bryant, Arkansas
- social icons only when real profile URLs exist
- legal-link slots only once approved content exists
- dynamic copyright year
- consistent mention of Prestige Signature Standard™ and P.O.I.S.E. Method™ where appropriate

Do not render:
- placeholder PO Box text
- fake social links
- fake legal content
- dead `#` links exposed to users

---

# 9. Homepage Full Mapping

## Section 1 — Hero

Eyebrow:
**PROFESSIONAL HOSPITALITY SERVICE TRAINING**

H1:
**Create Experiences Worth Remembering.**

Supporting copy:
**The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences.**

Primary CTA:
**Schedule a Discovery Consultation**

Secondary CTA:
**Explore Training Programs**

Visual:
- cinematic hospitality/training image
- strong black overlay for readability
- premium, full-width composition
- do not place copy over a visually noisy area
- do not use an autoplay hero video in Phase 1

A PolarPro-like treatment is appropriate:
- oversized type
- minimal UI
- edge-to-edge image
- strong text anchoring
- subtle on-load reveal
- compact controls

## Section 2 — The Prestige Difference

Headline/copy anchor:
**We don’t just train people to serve. We train professionals to create experiences worth remembering.**

Show five concise capability points:
- Practical, hands-on service training
- Professional presence and etiquette
- Guest communication and judgment
- Technical service execution
- Assessment and credential pathway

Use an editorial split layout rather than five generic icon cards if possible.

## Section 3 — The Prestige Signature Standard™

Supporting line:
**Powered by the P.O.I.S.E. Method™**

Sequence:
**PRESENCE → OBSERVE → INITIATE → SERVE → ELEVATE**

This should be a strong signature visual moment. Use five connected stages or a horizontal progression. On mobile, it may become a swipeable/horizontal CSS scroll row or stacked sequence.

Do not make it feel like a generic process diagram.

## Section 4 — Who We Serve

Show:
- Restaurants & Fine Dining
- Hotels & Resorts
- Golf & Country Clubs
- Private Clubs
- Event & Banquet Venues
- Catering & Event-Service Teams

Use strong photography and editorial labels. Link to `who-we-serve.html`.

## Section 5 — Training That Goes Beyond the Lecture

Primary sequence:
**Demonstration → Explanation → Practice → Assessment**

Copy:
**Prestige training is designed around observable professional behavior. Participants see the skill, understand the reason, practice the technique and demonstrate what they can do.**

Use one supplied training image prominently.

## Section 6 — Flagship Programs

Show four program cards:

| Program | Public price | Positioning |
|---|---:|---|
| Half-Day Customized Training | Starting at $3,750 | Focused skill gaps, refresher training or selected modules |
| Full-Day Customized Training | Starting at $6,000 | Broader service reset or multi-module development |
| Two-Day Signature Program | Starting at $10,000 | Deeper technical, behavioral and guest-experience development |
| Five-Day Prestige Full Academy | Starting at $35,000 | Comprehensive service development and professional credential pathway |

Private program pricing is per cohort of up to 25 participants.

CTA:
`Explore Training Programs`

Do not turn these into ecommerce purchase cards.

## Section 7 — Founder Preview

Title:
**Meet Nonceba Wimbley — Founder & Chief Executive Officer**

Founder belief:
**Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.**

CTA:
**Meet Our Founder**

Link to `about.html`.

Use a supplied professional CEO portrait.

## Section 8 — Closing CTA

Headline:
**READY TO ELEVATE YOUR SERVICE STANDARD?**

Copy:
**Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.**

CTA:
**Schedule a Discovery Consultation**

---

# 10. Training Programs Page Mapping

Hero:
**Professional Training Built Around the Guest Experience**

Intro:
**From focused skill development to the complete Prestige Full Academy, programs can be customized around the needs of the organization while preserving the Prestige professional service standard.**

## Private program rules

- maximum standard private cohort: 25 participants
- clients may select modules
- for 1–5 short-program cohorts there is no automatic multi-cohort discount
- 6 or more cohorts / 126+ participants: custom quote
- Full Academy multi-cohort pricing follows the approved current pricing guide

## Program cards

Use the four approved public starting prices:
- Half-Day Customized Training — $3,750
- Full-Day Customized Training — $6,000
- Two-Day Signature Program — $10,000
- Five-Day Prestige Full Academy — $35,000

Always say **Starting at** for public price presentation.

## Curriculum — 15 expandable module cards

Use accessible accordions/cards.

1. **Professional Presence & Appearance**  
   Professional image, grooming, posture, confidence and the way a service professional enters the guest experience.

2. **Tools of the Trade**  
   Understanding and professionally handling the tools used to deliver consistent service.

3. **Table & Place Setting**  
   Professional table setup, place settings and readiness standards.

4. **Plate Handling**  
   Safe, polished and controlled plate handling and service technique.

5. **Glassware**  
   Glassware recognition, handling, presentation and professional standards.

6. **Beverage Service**  
   Professional beverage presentation, handling and guest service technique.

7. **Bottle Service**  
   Physical bottle presentation, handling and pouring mechanics within Prestige’s service-training scope.

8. **The Guest Approach**  
   How to approach, greet and establish a professional guest relationship.

9. **Communication**  
   Clear, confident, respectful communication across different guests and situations.

10. **Reading the Table**  
    Observing cues, timing and guest behavior to determine when to act—and when not to interrupt.

11. **The Prestige Service Sequence**  
    A disciplined sequence that connects individual techniques into a polished service experience.

12. **Table Maintenance**  
    Maintaining cleanliness, order, readiness and guest comfort throughout the experience.

13. **Anticipating Guest Needs**  
    Moving from reactive service to thoughtful, proactive hospitality.

14. **Difficult Guests & Service Recovery**  
    Professional response, composure and recovery when the guest experience goes wrong.

15. **The Final Experience**  
    Integrated capstone applying the Prestige Signature Standard™ and P.O.I.S.E. Method™ in a realistic service experience.

Critical rule:
Do not publish full instructor curriculum, lesson plans, scoring rubrics, proprietary exercises or internal teaching material.

Closing CTA:
**Request a Custom Training Proposal**
→ contact/discovery form.

---

# 11. The Prestige Standard Page Mapping

Hero:
**Service Is More Than a Task. It Is a Standard.**

Intro:
**The Prestige Signature Standard™ defines how a professional presents, observes, acts, serves and elevates the guest experience.**

## P.O.I.S.E. Method™

Use these exact meanings:

| Stage | Website copy |
|---|---|
| P — Presence | Present yourself with confidence, professionalism and readiness before the first word is spoken. |
| O — Observe | Read the guest, table and environment. Notice what is happening before deciding what to do. |
| I — Initiate | Act proactively and appropriately rather than waiting for every need to be stated. |
| S — Serve | Execute the technical and interpersonal elements of service with precision and care. |
| E — Elevate | Turn technically correct service into an experience that feels thoughtful, personal and memorable. |

## Instructional Method

**Demonstration → Explanation → Practice → Assessment**

Supporting line:
**Exceptional service should be felt, not just taught.**

## Client SOP Integration

Copy:
**Prestige teaches universal professional service standards. When working with an organization, approved client SOPs and brand requirements can be layered into the training so employees understand both the professional standard and how their employer expects it to be executed.**

Use photography that communicates table detail, professional service and attentive observation.

---

# 12. Professional Credential Page Mapping

Hero title:
**Prestige Signature Standard Professional Service Credential™**

Intro:
**A professional credential is earned through demonstrated knowledge, practical service skill and successful completion of the Five-Day Prestige Full Academy requirements.**

## Credential requirements

- Five-Day Full Academy eligibility
- 90% attendance
- 80% knowledge assessment
- 80% practical assessment
- successful Module 15 capstone
- acceptable professional conduct, communication, presence and safe service

## Completion vs Credential

Explain visually that:

**Certificate of Completion**
- confirms participation/completion where applicable
- does not represent mastery of the Full Academy professional credential

**Professional Service Credential**
- is earned only by satisfying the Full Academy assessment and performance requirements

## Validity and renewal

- credential valid for 2 years
- Standard 2-Year Renewal: $650
- Late Reinstatement, 46 days to 1 year expired: $800
- Full Re-Certification Assessment, over 1 year expired: $950
- first retest within 30 days is complimentary
- credential registry will use unique credential numbers

CTA:
**Ask About the Full Academy**

Do not build public credential verification in Phase 1.

---

# 13. Who We Serve Page Mapping

Hero direction:
Premium professional hospitality service across multiple operating environments.

Core principle:
**Your Standards + The Prestige Standard**

Copy:
**Prestige does not replace a client’s approved operating procedures. We teach the professional service foundation and, where appropriate, integrate the organization’s SOPs, brand expectations and service sequence into the learning experience.**

Sector content:

| Sector | Approved focus |
|---|---|
| Restaurants & Fine Dining | Strengthen professional presence, technical service, table awareness, communication and consistency across the guest journey. |
| Hotels & Resorts | Support polished guest-facing service across dining and hospitality environments where the brand experience matters. |
| Golf & Country Clubs | Develop consistent, attentive service for members, guests, dining rooms and special events. |
| Private Clubs | Reinforce discretion, professionalism, anticipation and service standards in relationship-driven environments. |
| Event & Banquet Venues | Build coordinated service behavior, presentation and guest awareness in fast-moving event environments. |
| Catering & Event-Service Teams | Strengthen portable service standards, team coordination and professional execution across changing venues. |

Use editorial image panels, not six identical generic cards if a stronger layout is possible.

CTA:
Schedule a Discovery Consultation.

---

# 14. About Page Mapping

Hero:
**NONCEBA WIMBLEY • FOUNDER & CHIEF EXECUTIVE OFFICER**

Use supplied CEO imagery.

## Founder story

Use this approved story faithfully. Do not replace it with generated generic biography copy:

> Nonceba Wimbley’s hospitality journey began in Cape Town, South Africa, in late 2008, when she was 18 and straight out of high school. With no restaurant experience, she walked into Ocean Basket, sold herself on the opportunity and was hired on the spot.
>
> That opportunity became the beginning of a career in customer service and hospitality that has included work as a waiter, bartender, hostess, assistant manager and Front of House Manager, as well as experience in restaurants and a game-reserve lodge. Along the way, Nonceba trained and supervised employees, managed front-of-house operations and handled the moments that shape how guests remember an experience.
>
> Growing up and working in South Africa exposed her to different cultures, personalities, accents, beliefs, expectations and ways of communicating. It taught her that exceptional hospitality cannot be reduced to a script. A professional must know the standard—and also know how to see the individual guest in front of them.
>
> Prestige grew from something Nonceba kept noticing: employees were often expected to deliver exceptional service without ever being fully taught what exceptional service looks, sounds and feels like. Poor greetings. Incorrect glassware. Improper plate handling. Dirty tables left unattended. Staff talking or eating around guests. A lack of presence and awareness.
>
> The Prestige Signature Standard Academy was created to change that—to give hospitality professionals the training, tools, practice and confidence to become polished professionals who understand that service is not simply a transaction. It is an experience.

## Founder philosophy

- Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.
- A guest should never feel ignored, uncomfortable, embarrassed, or like an inconvenience.
- A great service professional always pays attention, anticipates needs, communicates with confidence, and makes every guest feel important.
- The biggest mistake is expecting employees to deliver exceptional service without giving them the training, tools, support, and example they need to succeed.

## Mission

**The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences while helping organizations build stronger service cultures and better-prepared teams.**

## Vision

**To establish the Prestige Signature Standard™ as a recognized standard of professional hospitality service and build an academy whose impact can be seen in stronger professionals, stronger businesses and unforgettable guest experiences.**

Do not add invented certifications, awards, employers, dates, qualifications or credentials.

---

# 15. Contact / Discovery Page Mapping

Hero:
**Let’s Talk About Your Service Experience.**

Intro:
**Tell us where your team is today, what you want guests to experience and where service feels inconsistent. Prestige begins with discovery before recommending a training solution.**

## Form fields

Build the complete final form UI now, but Phase 1 must not actually transmit data.

Fields:

| Field | Requirement / options |
|---|---|
| Name | Required |
| Company | Required |
| Title | Optional |
| Email | Required |
| Phone | Required |
| Industry | Restaurant / Hotel-Resort / Golf-Country Club / Private Club / Event-Banquet / Catering / Other |
| Number of Employees to Train | Required |
| City / State | Required |
| Training Interest | Half-Day / Full-Day / Two-Day / Full Academy / Open Enrollment / Not Sure |
| Desired Timing | Required |
| Current Service Challenge | Long text |
| Consent | Permission to contact regarding inquiry |

Submit button:
**Schedule a Discovery Consultation** or **Request My Discovery Call**, with preference given to the sitewide controlling CTA language.

### Phase 1 form behavior

- use native HTML constraints plus lightweight JS validation
- prevent actual submit
- do not show a fake "successfully submitted" message
- show a polished notice explaining that online submission is being connected and provide the real phone/email as immediate alternatives
- make `tel:` and `mailto:` links fully functional
- retain the form design so Supabase can be wired in without redesigning the UI

## Contact block

- The Prestige Signature Standard Academy
- Bryant, Arkansas
- 501-559-5118
- nwimbley@prestigesignaturestandard.com
- PrestigeSignatureStandard.com

Never display `PO Box: INSERT WHEN ESTABLISHED`.

---

# 16. Open Enrollment Page Mapping

Current launch state:
**No scheduled dates are required. Use an interest-list state.**

Rules:
- standard class minimum: 8 paid participants
- standard maximum: 25
- do not promise a session date until officially scheduled

Suggested headline:
**Professional Development. The Prestige Standard.**

Interest form:
- name
- email
- phone
- city/state
- employer/role optional
- program interest
- preferred timeframe
- consent to be contacted

Approved per-person pricing:

| Program | Per-person price |
|---|---:|
| Half-Day | $300 |
| Full-Day | $500 |
| Two-Day Signature Program | $900 |
| Five-Day Full Academy | $3,200 |

Design the page so it can later switch from "interest list" to actual session/event cards without a page redesign.

Do not invent dates, locations, remaining seats or availability.

---

# 17. Approved SEO Mapping

Use clean URLs/filenames and unique metadata.

| Page | SEO title |
|---|---|
| Home | Professional Hospitality Service Training \| Prestige Signature Standard Academy |
| Training Programs | Hospitality Training Programs \| Prestige Signature Standard Academy |
| The Prestige Standard | The Prestige Signature Standard & P.O.I.S.E. Method |
| Professional Credential | Prestige Professional Service Credential \| Hospitality |
| Who We Serve | Hospitality Service Training for Restaurants, Hotels & Clubs |
| About | About Nonceba Wimbley & The Prestige Academy |
| Contact | Schedule a Hospitality Training Discovery Consultation |

Use the supplied final meta descriptions where available.

Homepage meta description:
**Professional hospitality service training for restaurants, hotels, clubs and event teams. Build polished professionals and memorable guest experiences.**

Create sensible, non-keyword-stuffed descriptions for pages without a final one.

SEO implementation:
- correct `<title>`
- unique meta description
- canonical URL placeholder using `https://prestigesignaturestandard.com/...`
- Open Graph title/description/image
- Twitter Card metadata
- semantic heading hierarchy
- meaningful image alt text
- `Organization` or `EducationalOrganization` JSON-LD
- use Bryant, Arkansas as locality only; no fake street address
- do not imply Prestige only serves Arkansas; long-term positioning is national/international

---

# 18. Supplied Asset Mapping

Use the real supplied client assets. Do not download generic hospitality stock imagery while adequate client imagery exists.

Suggested mapping:

| Asset | Suggested use |
|---|---|
| `CEO.jpg` | Founder preview / About editorial portrait |
| `CEO2.jpg` | About hero / Founder portrait |
| `Ceo_in_meeting.jpg` | About authority / organization discovery section |
| `Ceo_waiter_traing.jpg` | training method / practical coaching |
| `ceo_training_waiters_2.jpg` | homepage hero or training page hero |
| `PHOTO-2026-09-18-13-54-59.jpg` | fine dining / who we serve |
| `bartender.jpg` | beverage-service module / sector montage |
| `male_waiter_serving.jpg` | technical service / program imagery |
| `meeting_setting.jpg` | training environment / premium service system |
| `table_setting.jpg` | Prestige Standard / table-setting module |
| `waiter_award.jpg` | Professional Credential page |
| `waiter_outside.jpg` | clubs/resorts sector |
| `waiter_serving.jpg` | service sequence / restaurant sector |
| `waiter_setting_table.jpg` | table-setting / training |
| `waiter_training.jpg` | open enrollment / Academy experience |
| `waiter_wine_bottle.jpg` | bottle-service module |
| `waiters.jpg` | team/cohort section |
| `woman waiter.jpg` | hospitality sector/editorial card |
| `Logo.jpg` | approved brand asset, used carefully |
| `website_template1.jpg` | visual reference only |
| `website_template_2.jpg` | visual reference only |

Important:
- the supplied images are mainly around 1024–1536px on their longest side
- use them intelligently and avoid excessive upscaling on very large desktop displays
- use dark overlays where useful
- use responsive `object-position` per image
- preserve originals
- if local tooling exists, generate optimized WebP/AVIF derivatives and responsive sizes
- always include `width`, `height`, alt text and sensible loading behavior
- hero image should use eager/fetch-priority loading
- below-the-fold images should lazy load

### Logo risk

The package contains a JPG rather than an obvious transparent SVG/PNG master logo. Do not redesign or invent a logo. Use the supplied asset as faithfully as possible for development, but document a **pre-launch asset request** for a clean high-resolution transparent PNG/SVG/AI/EPS version of the approved master logo if one is not already present elsewhere in the repository.

---

# 19. Design System / Component Language

The site should use a small reusable visual system even though it is static HTML.

## Containers
- text container: approximately 1200–1320px
- wide media container: approximately 1600–1800px
- fluid side padding via `clamp()`
- allow select hero/media sections to bleed wider

## Section spacing
Use generous vertical rhythm, approximately:
`clamp(4.5rem, 8vw, 9rem)`

## Cards
- restrained radius, roughly 18–28px
- very light border or no border
- minimal shadow
- image-first design
- premium hover states
- avoid dashboard-style cards

## Buttons
Primary:
- dark or gold depending on background
- pill or rounded-full treatment
- strong label
- subtle arrow movement on hover
- no glossy gradient

Secondary:
- outline/ghost
- preserve strong contrast
- use gold line/underline sparingly

## Editorial rules
- alternate dark and light sections
- avoid repetitive 3-column grids for every section
- use asymmetry, image/text splits and wide feature blocks
- one large visual idea per section
- content should breathe

---

# 20. Interaction Design

Use vanilla JS only.

Required:
- accessible mobile nav
- active nav state
- sticky-header state on scroll
- accessible curriculum accordions
- restrained reveal animation using `IntersectionObserver`
- dynamic footer year
- Phase 1 form validation and placeholder submission behavior

Optional if it improves the composition without adding complexity:
- subtle image parallax of only a few pixels
- horizontal scroll snapping for card rows on mobile
- simple POISE stage hover/focus interactions

Do not use:
- scroll-jacking
- cursor hijacking
- heavy animation libraries
- autoplay audio
- loading screens
- excessive parallax
- rotating carousels that hide core content
- gimmicky text effects

Respect `prefers-reduced-motion`.

---

# 21. Accessibility

Target WCAG 2.2 AA quality.

Must include:
- semantic landmarks: header/nav/main/footer
- skip-to-content link
- visible keyboard focus states
- sufficient contrast
- correct label/input associations
- descriptive validation/error messaging
- `aria-expanded`/`aria-controls` for accordions
- keyboard-operable mobile menu
- no content available only on hover
- alt text based on the purpose of the image
- decorative images use empty alt where appropriate
- logical heading order
- minimum comfortable touch targets
- no tiny gold-on-cream text
- reduced-motion support

---

# 22. Performance

Goals:
- static, lightweight, fast
- no unnecessary libraries
- one primary compiled CSS bundle
- one small JS bundle/file
- optimized images
- avoid layout shift
- preload only what is genuinely critical
- lazy-load noncritical media
- reserve image dimensions
- use responsive `srcset` when derivatives exist
- no autoplay background video in Phase 1
- no third-party trackers in development

When production analytics are later introduced, load them deliberately and only after the client chooses the platform.

---

# 23. Phase 2 Supabase Architecture

Do **not** implement Supabase in Phase 1. Prepare the front-end and document the integration path.

Create `docs/PHASE_2_SUPABASE.md`.

## Phase 2 objectives

1. save discovery inquiries securely
2. email the designated Prestige inbox
3. capture open-enrollment interest
4. optionally publish open-enrollment sessions from Supabase
5. preserve the same front-end form UI
6. create a foundation for later credential verification without implementing it yet

## Recommended data flow

```text
Browser form
   ↓
Supabase Edge Function
   ↓
server-side validation / anti-spam
   ↓
Supabase Postgres insert
   ↓
email notification service
   ↓
Prestige inbox
```

Do not put an email-provider API key or Supabase service-role key in browser JavaScript.

The public Supabase anon key may be used in the frontend only with correct RLS, but for inquiry workflows an Edge Function is preferred so validation, spam controls and email notification happen server-side.

## Suggested table: `contact_inquiries`

Fields:
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`
- `name text not null`
- `company text not null`
- `title text null`
- `email text not null`
- `phone text not null`
- `industry text not null`
- `employee_count integer or text not null`
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

Do not expose public read access to this table.

## Suggested table: `open_enrollment_interests`

Fields:
- `id uuid primary key`
- `created_at timestamptz`
- `name`
- `email`
- `phone`
- `city_state`
- `employer_role`
- `program_interest`
- `preferred_timeframe`
- `consent`
- `status default 'new'`

No public select.

## Suggested future table: `open_enrollment_sessions`

Fields:
- `id`
- `program_slug`
- `title`
- `start_date`
- `end_date`
- `location_name`
- `city_state`
- `price`
- `capacity`
- `registration_status`
- `published`
- `created_at`
- `updated_at`

RLS:
- anonymous users may read only rows where `published = true`
- no anonymous write access
- sessions managed through Supabase Dashboard initially; do not build an admin portal unless separately requested

## Email notifications

Use an Edge Function and a transactional provider such as Resend, Postmark or SendGrid selected later.

Flow:
1. validate incoming payload
2. check anti-spam token
3. normalize fields
4. insert database record
5. email Prestige with structured inquiry summary
6. optionally send a neutral acknowledgement to the submitter
7. return non-sensitive success response

## Spam protection

At Phase 2:
- honeypot
- rate limiting where feasible
- Cloudflare Turnstile or equivalent if needed
- server-side input length limits
- strict allow-lists for select values

## Phase 2 environment variables

Never hardcode secrets.

Expected environment variables may include:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- service role key only inside server/Edge Function environment
- email provider secret only inside Edge Function environment
- anti-spam secret only server-side

## Credential verification

The blueprint describes a future credential registry with unique credential numbers.

Do not implement this in Phase 2 unless separately authorized. When implemented later, expose only the minimum public verification data necessary and never a full credential database.

---

# 24. Repository Handling Rules for Codex

You are working inside an **existing folder**.

Before changing anything:

1. inspect the repository tree
2. inspect `git status` if Git is present
3. identify current HTML/CSS/JS/build files
4. identify which existing files are old starter/template content
5. identify assets and configuration that should be preserved
6. determine whether Tailwind is already configured
7. produce a short implementation plan before editing

You may replace or delete obsolete starter front-end files if they conflict with this new build.

Never blindly delete:
- `.git`
- `.gitignore`
- useful README/project notes
- deployment configuration
- package-lock files without a reason
- supplied client assets
- environment files
- unrelated project files

If the old site is clearly throwaway starter content, replace it cleanly.

---

# 25. Codex Execution Prompt

Copy everything below into Codex.

---

## CODEX PROMPT START

You are the senior front-end engineer responsible for rebuilding the existing project folder into the official Phase 1 website for **The Prestige Signature Standard Academy**.

### Objective

Create a premium, production-quality, responsive multi-page website using:
- semantic HTML
- vanilla JavaScript
- Tailwind CSS
- small amounts of custom CSS only where appropriate

This is a static Phase 1 site. Do not add React, Vue, Angular, Next.js, WordPress, a CMS, a server framework or Supabase code yet.

The finished site must communicate:
**Luxury Hospitality + Executive/Professional Training + International Service Standards.**

The design should take inspiration from:
`https://www.polarpro.com/`

Use PolarPro only as a **visual design reference**:
- large editorial type
- full-width imagery
- strong black/light contrast
- generous whitespace
- fluid responsive typography
- image-led content blocks
- minimal interface chrome
- premium rounded controls/cards
- subtle transitions and micro-interactions

Do not clone PolarPro, reuse its content/assets, or reproduce its ecommerce structure.

Prestige must retain its own visual language:
- Black `#171512`
- Champagne Gold `#B08D57`
- Deep Gold `#806333`
- Ivory `#F4EFE5`
- Warm Cream `#E8DFD0`
- Soft Charcoal `#49453F`
- elegant serif display typography
- clean modern sans-serif body/UI typography

### Source authority

If any existing project content or older client material conflicts with this prompt, follow the rules below:

1. `Prestige_FINAL_Website_Design_and_Development_Blueprint_v1.docx` is the controlling source.
2. `Prestige_Website_Strategy.docx` is supporting only.
3. `Prestige_Signature_Standard_Academy_Final_Website_Blueprint.docx` is supporting only.
4. `website_template1.jpg` and `website_template_2.jpg` are visual references only.
5. The supplied PolarPro HAR/reference is design inspiration only.

Critical corrections:
- Founder is **Nonceba Wimbley**
- Public title is **Founder & Chief Executive Officer**
- Never use "Natasha Wimbley"
- Primary CTA is **Schedule a Discovery Consultation**
- Homepage H1 is **Create Experiences Worth Remembering.**
- Do not build Online Academy, Resources, or the older For Businesses architecture in Phase 1
- Do not invent testimonials, clients, metrics, credentials, results, awards, accreditations or partnerships

### Step 1 — Audit before editing

First inspect the existing folder and report:
- current file tree
- current stack
- existing Tailwind/build setup
- reusable assets
- obsolete starter files
- any risks

If Git exists, inspect `git status`.

Then create a concise implementation plan.

Only after that, begin editing.

You may delete or replace obsolete starter HTML/CSS/JS files, but do not delete Git metadata, deployment configuration, environment files, client assets, or useful project documentation without a specific reason.

### Step 2 — Target pages

Build:

- `index.html`
- `training-programs.html`
- `prestige-standard.html`
- `professional-credential.html`
- `who-we-serve.html`
- `about.html`
- `contact.html`
- `open-enrollment.html`
- `404.html`

All pages must share one coherent design system.

### Step 3 — Recommended project structure

Prefer:

```text
assets/
  css/
    input.css
    site.css
  js/
    main.js
  images/
    originals/
    optimized/
  icons/
docs/
  PHASE_2_SUPABASE.md
```

Adapt this to the existing project rather than forcing destructive restructuring.

### Step 4 — Tailwind setup

Use Tailwind as the primary utility system.

If Tailwind already exists, preserve and improve the existing setup.

If it does not exist, add the smallest sensible local build setup for a static site.

Do not use Tailwind's CDN build as the final production approach.

Do not pin or migrate a major Tailwind version unnecessarily. Work with the current project environment.

Create reusable CSS variables for the Prestige palette and typography so the visual system is not scattered across hardcoded values.

Use custom CSS only for:
- design tokens where useful
- fluid type/spacing if clearer than utility-only markup
- subtle reveal animation
- decorative image overlays
- special editorial layouts
- accessibility/reduced-motion behavior

### Step 5 — Typography

Use:
- Cormorant Garamond or a similar elegant open-license serif for display/headings
- Manrope or a similar modern open-license sans-serif for body/UI

If fonts cannot be downloaded in the current environment, use correct fallbacks and keep the typography configuration easy to swap later.

Do not use unlicensed commercial font files.

Use fluid type with `clamp()`.

Hero H1 should feel large and editorial without breaking on mobile.

### Step 6 — Global navigation

Navigation:
- Home
- Training Programs
- The Prestige Standard
- Professional Credential
- Who We Serve
- About
- Contact
- OPEN ENROLLMENT

Primary sitewide CTA:
**Schedule a Discovery Consultation**

CTA destination:
`contact.html#discovery-form`

Open Enrollment destination:
`open-enrollment.html`

Header requirements:
- sticky
- premium black treatment
- responsive
- accessible
- collapse before it becomes cramped
- mobile menu must expose Open Enrollment and Discovery CTA clearly
- visible focus states
- Escape closes menu
- clicking a menu link closes it
- body scroll locking when menu is open if needed

### Step 7 — Homepage

Build sections in this order:

1. Hero
2. Prestige Difference
3. Prestige Signature Standard / POISE
4. Who We Serve
5. Training That Goes Beyond the Lecture
6. Flagship Programs
7. Founder Preview
8. Closing CTA

Hero content:

Eyebrow:
`PROFESSIONAL HOSPITALITY SERVICE TRAINING`

H1:
`Create Experiences Worth Remembering.`

Body:
`The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences.`

Primary CTA:
`Schedule a Discovery Consultation`

Secondary CTA:
`Explore Training Programs`

Prestige Difference positioning:
`We don’t just train people to serve. We train professionals to create experiences worth remembering.`

Five points:
- Practical, hands-on service training
- Professional presence and etiquette
- Guest communication and judgment
- Technical service execution
- Assessment and credential pathway

POISE:
`PRESENCE → OBSERVE → INITIATE → SERVE → ELEVATE`

Who We Serve:
- Restaurants & Fine Dining
- Hotels & Resorts
- Golf & Country Clubs
- Private Clubs
- Event & Banquet Venues
- Catering & Event-Service Teams

Learning model:
`Demonstration → Explanation → Practice → Assessment`

Learning copy:
`Prestige training is designed around observable professional behavior. Participants see the skill, understand the reason, practice the technique and demonstrate what they can do.`

Program cards:
- Half-Day Customized Training — Starting at $3,750
- Full-Day Customized Training — Starting at $6,000
- Two-Day Signature Program — Starting at $10,000
- Five-Day Prestige Full Academy — Starting at $35,000

Private cohorts:
`Up to 25 participants.`

Founder preview:
`Meet Nonceba Wimbley — Founder & Chief Executive Officer`

Founder quote:
`Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.`

Closing CTA heading:
`READY TO ELEVATE YOUR SERVICE STANDARD?`

Closing copy:
`Tell us what your team is experiencing. Prestige will begin with discovery before recommending a program.`

### Step 8 — Training Programs page

Hero:
`Professional Training Built Around the Guest Experience`

Intro:
`From focused skill development to the complete Prestige Full Academy, programs can be customized around the needs of the organization while preserving the Prestige professional service standard.`

Rules:
- max standard private cohort: 25
- clients may select modules
- 1–5 short-program cohorts: no automatic multi-cohort discount
- 6+ cohorts / 126+ participants: custom quote
- Full Academy multi-cohort pricing follows the approved pricing guide

Pricing:
- Half-Day Customized Training — Starting at $3,750
- Full-Day Customized Training — Starting at $6,000
- Two-Day Signature Program — Starting at $10,000
- Five-Day Prestige Full Academy — Starting at $35,000

Build accessible accordions for the 15 modules:

1. Professional Presence & Appearance — Professional image, grooming, posture, confidence and the way a service professional enters the guest experience.
2. Tools of the Trade — Understanding and professionally handling the tools used to deliver consistent service.
3. Table & Place Setting — Professional table setup, place settings and readiness standards.
4. Plate Handling — Safe, polished and controlled plate handling and service technique.
5. Glassware — Glassware recognition, handling, presentation and professional standards.
6. Beverage Service — Professional beverage presentation, handling and guest service technique.
7. Bottle Service — Physical bottle presentation, handling and pouring mechanics within Prestige’s service-training scope.
8. The Guest Approach — How to approach, greet and establish a professional guest relationship.
9. Communication — Clear, confident, respectful communication across different guests and situations.
10. Reading the Table — Observing cues, timing and guest behavior to determine when to act—and when not to interrupt.
11. The Prestige Service Sequence — A disciplined sequence that connects individual techniques into a polished service experience.
12. Table Maintenance — Maintaining cleanliness, order, readiness and guest comfort throughout the experience.
13. Anticipating Guest Needs — Moving from reactive service to thoughtful, proactive hospitality.
14. Difficult Guests & Service Recovery — Professional response, composure and recovery when the guest experience goes wrong.
15. The Final Experience — Integrated capstone applying the Prestige Signature Standard™ and P.O.I.S.E. Method™ in a realistic service experience.

Do not publish instructor-level curriculum, lesson plans, proprietary exercises or scoring rubrics.

### Step 9 — Prestige Standard page

Hero:
`Service Is More Than a Task. It Is a Standard.`

Intro:
`The Prestige Signature Standard™ defines how a professional presents, observes, acts, serves and elevates the guest experience.`

POISE copy:
- P — Presence: Present yourself with confidence, professionalism and readiness before the first word is spoken.
- O — Observe: Read the guest, table and environment. Notice what is happening before deciding what to do.
- I — Initiate: Act proactively and appropriately rather than waiting for every need to be stated.
- S — Serve: Execute the technical and interpersonal elements of service with precision and care.
- E — Elevate: Turn technically correct service into an experience that feels thoughtful, personal and memorable.

Instructional method:
`Demonstration → Explanation → Practice → Assessment`

Line:
`Exceptional service should be felt, not just taught.`

SOP integration:
`Prestige teaches universal professional service standards. When working with an organization, approved client SOPs and brand requirements can be layered into the training so employees understand both the professional standard and how their employer expects it to be executed.`

### Step 10 — Professional Credential page

Title:
`Prestige Signature Standard Professional Service Credential™`

Intro:
`A professional credential is earned through demonstrated knowledge, practical service skill and successful completion of the Five-Day Prestige Full Academy requirements.`

Requirements:
- Five-Day Full Academy eligibility
- 90% attendance
- 80% knowledge assessment
- 80% practical assessment
- successful Module 15 capstone
- acceptable professional conduct, communication, presence and safe service

Completion:
- Certificate of Completion = participation/completion where applicable; not mastery of the Full Academy credential
- Professional Service Credential = earned only after satisfying Full Academy assessment/performance requirements

Renewal:
- credential valid 2 years
- Standard 2-Year Renewal: $650
- Late Reinstatement, 46 days to 1 year expired: $800
- Full Re-Certification Assessment, over 1 year expired: $950
- first retest within 30 days complimentary
- future registry uses unique credential numbers

CTA:
`Ask About the Full Academy`

Do not create credential lookup yet.

### Step 11 — Who We Serve page

Use six sectors and approved copy:

Restaurants & Fine Dining:
`Strengthen professional presence, technical service, table awareness, communication and consistency across the guest journey.`

Hotels & Resorts:
`Support polished guest-facing service across dining and hospitality environments where the brand experience matters.`

Golf & Country Clubs:
`Develop consistent, attentive service for members, guests, dining rooms and special events.`

Private Clubs:
`Reinforce discretion, professionalism, anticipation and service standards in relationship-driven environments.`

Event & Banquet Venues:
`Build coordinated service behavior, presentation and guest awareness in fast-moving event environments.`

Catering & Event-Service Teams:
`Strengthen portable service standards, team coordination and professional execution across changing venues.`

Include:
`Prestige does not replace a client’s approved operating procedures. We teach the professional service foundation and, where appropriate, integrate the organization’s SOPs, brand expectations and service sequence into the learning experience.`

### Step 12 — About page

Hero identity:
`NONCEBA WIMBLEY • FOUNDER & CHIEF EXECUTIVE OFFICER`

Use the approved founder story from this prompt exactly in substance. Do not rewrite it into generic AI marketing language.

Founder story:

`Nonceba Wimbley’s hospitality journey began in Cape Town, South Africa, in late 2008, when she was 18 and straight out of high school. With no restaurant experience, she walked into Ocean Basket, sold herself on the opportunity and was hired on the spot.`

`That opportunity became the beginning of a career in customer service and hospitality that has included work as a waiter, bartender, hostess, assistant manager and Front of House Manager, as well as experience in restaurants and a game-reserve lodge. Along the way, Nonceba trained and supervised employees, managed front-of-house operations and handled the moments that shape how guests remember an experience.`

`Growing up and working in South Africa exposed her to different cultures, personalities, accents, beliefs, expectations and ways of communicating. It taught her that exceptional hospitality cannot be reduced to a script. A professional must know the standard—and also know how to see the individual guest in front of them.`

`Prestige grew from something Nonceba kept noticing: employees were often expected to deliver exceptional service without ever being fully taught what exceptional service looks, sounds and feels like. Poor greetings. Incorrect glassware. Improper plate handling. Dirty tables left unattended. Staff talking or eating around guests. A lack of presence and awareness.`

`The Prestige Signature Standard Academy was created to change that—to give hospitality professionals the training, tools, practice and confidence to become polished professionals who understand that service is not simply a transaction. It is an experience.`

Founder philosophy:
- Hospitality is making people feel genuinely welcomed, valued, respected, and cared for—not simply served.
- A guest should never feel ignored, uncomfortable, embarrassed, or like an inconvenience.
- A great service professional always pays attention, anticipates needs, communicates with confidence, and makes every guest feel important.
- The biggest mistake is expecting employees to deliver exceptional service without giving them the training, tools, support, and example they need to succeed.

Mission:
`The Prestige Signature Standard Academy equips hospitality professionals with the skills, confidence, professional presence and service standards needed to create exceptional guest experiences while helping organizations build stronger service cultures and better-prepared teams.`

Vision:
`To establish the Prestige Signature Standard™ as a recognized standard of professional hospitality service and build an academy whose impact can be seen in stronger professionals, stronger businesses and unforgettable guest experiences.`

### Step 13 — Contact page

Hero:
`Let’s Talk About Your Service Experience.`

Intro:
`Tell us where your team is today, what you want guests to experience and where service feels inconsistent. Prestige begins with discovery before recommending a training solution.`

Build the full UI for these fields:
- Name *
- Company *
- Title
- Email *
- Phone *
- Industry *
- Number of Employees to Train *
- City / State *
- Training Interest *
- Desired Timing *
- Current Service Challenge
- Consent *

Industry values:
- Restaurant
- Hotel-Resort
- Golf-Country Club
- Private Club
- Event-Banquet
- Catering
- Other

Training Interest values:
- Half-Day
- Full-Day
- Two-Day
- Full Academy
- Open Enrollment
- Not Sure

Phase 1:
- client-side validation only
- `preventDefault()` on submit
- never pretend a request was received
- show a polished message that online submission is being connected and provide:
  - `tel:+15015595118`
  - `mailto:nwimbley@prestigesignaturestandard.com`

Keep the markup/data names ready for Phase 2 Supabase.

Contact info:
- The Prestige Signature Standard Academy
- Bryant, Arkansas
- 501-559-5118
- nwimbley@prestigesignaturestandard.com
- PrestigeSignatureStandard.com

Never show a placeholder PO Box.

### Step 14 — Open Enrollment page

Current state:
no confirmed session dates.

Do not render an empty events calendar.

Use:
`Professional Development. The Prestige Standard.`

Explain:
- minimum 8 paid participants
- maximum 25
- dates announced only after a session is officially scheduled

Per-person pricing:
- Half-Day — $300
- Full-Day — $500
- Two-Day Signature Program — $900
- Five-Day Full Academy — $3,200

Interest form:
- name
- email
- phone
- city/state
- employer/role optional
- program interest
- preferred timeframe
- consent

Same Phase 1 placeholder behavior as Contact.

Build the page architecture so Phase 2 can swap in live session cards without redesigning the page.

### Step 15 — Assets

Use supplied client imagery before looking for external stock.

Expected filenames include:
- CEO.jpg
- CEO2.jpg
- Ceo_in_meeting.jpg
- Ceo_waiter_traing.jpg
- ceo_training_waiters_2.jpg
- PHOTO-2026-09-18-13-54-59.jpg
- bartender.jpg
- male_waiter_serving.jpg
- meeting_setting.jpg
- table_setting.jpg
- waiter_award.jpg
- waiter_outside.jpg
- waiter_serving.jpg
- waiter_setting_table.jpg
- waiter_training.jpg
- waiter_wine_bottle.jpg
- waiters.jpg
- woman waiter.jpg
- Logo.jpg

Do not treat `website_template1.jpg` or `website_template_2.jpg` as production content; they are reference images.

Suggested assignment:
- hero/training: ceo_training_waiters_2.jpg
- founder: CEO.jpg / CEO2.jpg
- About authority: Ceo_in_meeting.jpg
- practical instruction: Ceo_waiter_traing.jpg
- fine dining: PHOTO-2026-09-18-13-54-59.jpg
- standard/table: table_setting.jpg / waiter_setting_table.jpg
- credential: waiter_award.jpg
- beverage: bartender.jpg / waiter_wine_bottle.jpg
- sectors: waiter_outside.jpg / waiter_serving.jpg / woman waiter.jpg / male_waiter_serving.jpg
- cohorts: waiters.jpg / waiter_training.jpg

Do not upscale aggressively.

If image conversion tooling is available, preserve originals and create optimized responsive WebP/AVIF derivatives. Otherwise use the supplied JPGs with correct sizing and loading behavior.

Logo:
do not redesign it. If no clean transparent logo asset exists, use the provided asset carefully and note in README that a transparent high-resolution SVG/PNG master is a pre-launch requirement.

### Step 16 — Visual quality bar

Use PolarPro-level restraint, not a generic black/gold template.

Key qualities:
- confident full-bleed image moments
- very strong whitespace
- oversized but controlled display typography
- elegant hierarchy
- alternating light/dark sections
- strong image crops
- minimal borders
- subtle radii
- minimal shadows
- gold used as accent, not as fill everywhere
- premium CTA treatment
- exact alignment
- strong mobile composition

Avoid:
- repetitive icon-card grids on every section
- stock-template decorations
- huge gold gradients
- glowing text
- spinning elements
- slideshow heroes
- cheap luxury effects
- fake counters
- fake testimonials
- fake client logos
- ecommerce language such as "buy now"

### Step 17 — JavaScript

Keep JS small and dependency-free.

Implement:
- mobile navigation
- active navigation state
- sticky-header visual state
- curriculum accordion
- reveal-on-scroll
- dynamic footer year
- Phase 1 form behavior

Use `IntersectionObserver`.

Respect `prefers-reduced-motion`.

Do not use animation libraries.

### Step 18 — Accessibility

Implement:
- skip link
- semantic landmarks
- correct headings
- visible focus
- accessible mobile nav
- `aria-expanded` / `aria-controls`
- accessible accordions
- form labels
- inline validation
- sufficient contrast
- touch targets
- alt text
- keyboard support
- reduced motion

Target WCAG 2.2 AA.

### Step 19 — SEO

Create correct metadata per page.

Home title:
`Professional Hospitality Service Training | Prestige Signature Standard Academy`

Home description:
`Professional hospitality service training for restaurants, hotels, clubs and event teams. Build polished professionals and memorable guest experiences.`

Other titles:
- Training Programs — `Hospitality Training Programs | Prestige Signature Standard Academy`
- Prestige Standard — `The Prestige Signature Standard & P.O.I.S.E. Method`
- Professional Credential — `Prestige Professional Service Credential | Hospitality`
- Who We Serve — `Hospitality Service Training for Restaurants, Hotels & Clubs`
- About — `About Nonceba Wimbley & The Prestige Academy`
- Contact — `Schedule a Hospitality Training Discovery Consultation`

Implement:
- canonical tags
- Open Graph
- Twitter metadata
- favicon/site icon if a usable brand asset exists
- Organization/EducationalOrganization JSON-LD
- clean headings
- meaningful alt text

Use:
`https://prestigesignaturestandard.com/`
as the canonical domain direction, but keep path handling easy to update.

### Step 20 — Phase 2 documentation only

Create:
`docs/PHASE_2_SUPABASE.md`

Document a future architecture:

`Browser → Supabase Edge Function → validation/anti-spam → Postgres insert → email notification`

Document tables:
- `contact_inquiries`
- `open_enrollment_interests`
- `open_enrollment_sessions` for later published dates

Do not add live Supabase calls in Phase 1.

Security notes:
- no service-role key in browser
- no email-provider secret in browser
- no public SELECT on inquiry tables
- use RLS
- prefer Edge Function for inquiry writes and email
- later add Turnstile/honeypot/rate controls
- Supabase Dashboard can manage session rows initially; no admin UI now

Mention that credential lookup is a later optional phase, not part of Phase 2 unless separately approved.

### Step 21 — QA

Before declaring complete, check:

- all 9 pages render
- all navigation links work
- no placeholder/lorem ipsum text
- no fake data
- no placeholder PO Box
- no "Natasha Wimbley"
- no unapproved Founder title
- POISE sequence is exactly:
  Presence → Observe → Initiate → Serve → Elevate
- 15 module names are correct
- private program prices are correct
- open enrollment per-person prices are correct
- credential renewal prices are correct
- all images have alt text
- no missing assets
- no horizontal overflow
- header works at desktop/tablet/mobile widths
- keyboard navigation works
- accordions work with keyboard
- forms validate without transmitting
- phone/email links work
- reduced motion works
- no console errors
- current Chrome/Edge/Safari-compatible HTML/CSS/JS
- page titles and descriptions are unique
- 404 page exists
- CSS is compiled for production
- no unused prototype code
- no obvious dead links

Test at least:
- 360px
- 390px
- 768px
- 1024px
- 1280px
- 1440px
- wide desktop

### Step 22 — Final deliverable from Codex

At completion, provide:
1. summary of files changed/deleted/created
2. final route list
3. build/run commands
4. important design decisions
5. any missing client assets/content
6. Phase 2 Supabase readiness summary
7. QA performed
8. any remaining pre-launch tasks

Do not stop after creating a homepage. Complete the entire Phase 1 site.

## CODEX PROMPT END

---

# 26. Recommended Pre-Launch Client Requests

These are not blockers for initial coding, but should be resolved before final production launch:

1. Transparent/high-resolution master logo (prefer SVG; otherwise transparent PNG).
2. Confirm whether official social profiles exist and provide exact URLs.
3. Provide the final PO Box if one is to be published.
4. Provide approved Privacy Policy / Terms / Accessibility text where applicable.
5. Confirm whether any final brand font files exist and are licensed for web use.
6. Confirm Phase 2 email destination remains `nwimbley@prestigesignaturestandard.com`.
7. Confirm the preferred email provider when Supabase form automation is implemented.
8. Confirm whether future open-enrollment sessions will be managed directly in Supabase Dashboard or another calendar/scheduling platform.

---

# 27. Final Implementation Principle

The website must not feel like a course catalogue with decorative luxury styling.

It should feel like an **established premium hospitality training brand** whose standards, methodology, people and service philosophy are the product.

Use:
- image-led storytelling
- clear commercial hierarchy
- measured copy
- intentional whitespace
- strong editorial typography
- restrained gold
- unmistakable calls to action

The purpose of the design is to make a hospitality executive understand, within seconds:

1. what Prestige is,
2. what makes its methodology distinctive,
3. who it serves,
4. what training options exist,
5. why the Founder and Academy are credible,
6. and how to begin a serious training conversation.
