import { PROGRAMS, money } from '../assets/js/programs.mjs';
import { BOOKING_CONFIG } from '../assets/js/booking-config.mjs';

export function trainingPaths() {
  return `<section class="section training-paths bg-cream" id="training-paths"><div class="wrap">
    <div class="path-heading"><p class="eyebrow">Your next step</p><h2 class="section-title">How would you like to train?</h2><p>One exceptional standard. A path built around you.</p></div>
    <div class="path-grid">
      <a class="training-path" href="private-training.html"><span class="path-number">01 / For organizations</span><h3>Training for<br>My Organization</h3><p>Customized private hospitality training for organizational teams. Develop a shared standard, together.</p><span class="path-link">Explore Private Training <span aria-hidden="true">↗</span></span></a>
      <a class="training-path path-dark" href="open-enrollment.html#booking"><span class="path-number">02 / For individuals</span><h3>Training for<br>Myself</h3><p>Individual professional hospitality training through Open Enrollment. Invest in the professional you can become.</p><span class="path-link">View Available Training <span aria-hidden="true">↗</span></span></a>
    </div></div></section>`;
}

export function bookingMarkup(kind, mode = BOOKING_CONFIG.paymentMode) {
  if (mode === 'payment-links') return paymentLinksMarkup(kind);
  const privateTraining = kind === 'private';
  return `<section class="section bg-ivory booking-section" id="booking" data-booking="${kind}">
    <div class="wrap"><div class="booking-heading"><p class="eyebrow">${privateTraining ? 'Your team. Your training.' : 'Your professional development starts here.'}</p><h2 class="section-title">${privateTraining ? 'Plan your private training' : 'Find your next training experience'}</h2><p>${privateTraining ? 'Choose your program and training dates, then review your payment options.' : 'Choose your program, find an available session and register. Training begins November 2, 2026.'}</p></div>
    <ol class="booking-steps" aria-label="Booking steps"><li><span>01</span> Choose a program</li><li><span>02</span> Find your dates</li><li><span>03</span> ${privateTraining ? 'Review & book' : 'Register & pay'}</li></ol>
    <form data-booking-form>
      <fieldset class="booking-programs" id="pricing"><legend><span class="eyebrow">01 / Program</span> ${privateTraining ? 'What would you like to develop?' : 'Choose your program'}</legend><div class="booking-options">${PROGRAMS.map((p,i) => `<label class="booking-option"><input type="radio" name="program" value="${p.id}" ${i === 0 ? 'checked' : ''}><span class="option-content"><span class="option-duration">${p.halfDay ? 'AM or PM session' : `${p.days} training ${p.days === 1 ? 'day' : 'days'}`}</span><strong>${p.name}</strong><span>${p.benefit}</span>${privateTraining ? '' : `<span class="option-price">${money(p.enrollment)} <small>/ person</small></span>`}</span></label>`).join('')}</div></fieldset>
      <div class="booking-workspace"><div class="booking-main">
        <fieldset class="booking-dates"><legend><span class="eyebrow">02 / Availability</span> Choose a starting date</legend>
          <p class="booking-hint" data-duration-hint></p>
          <div class="calendar-toolbar"><button type="button" class="calendar-arrow" data-month-prev aria-label="Previous month">←</button><h3 data-month-label>November 2026</h3><button type="button" class="calendar-arrow" data-month-next aria-label="Next month">→</button></div>
          <div class="calendar-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
          <div class="calendar-grid" data-calendar aria-label="Available training start dates"></div>
          <p class="calendar-key"><span></span> Available start date <span class="key-selected"></span> Your selection</p>
          <p class="booking-service-message" data-availability-message role="status">Checking training availability…</p>
          <div data-session-options class="session-options"></div>
        </fieldset>
        <fieldset class="booking-details"><legend><span class="eyebrow">03 / Your details</span> ${privateTraining ? 'Bring your team to Prestige' : 'Make your next move'}</legend>
          <div class="form-grid two"><div class="field"><label for="booking-name">Full name *</label><input id="booking-name" name="name" required maxlength="160" autocomplete="name"></div><div class="field"><label for="booking-email">Email *</label><input id="booking-email" name="email" type="email" required maxlength="254" autocomplete="email"></div><div class="field"><label for="booking-phone">Phone *</label><input id="booking-phone" name="phone" type="tel" required maxlength="50" autocomplete="tel"></div><div class="field"><label for="booking-company">${privateTraining ? 'Organization *' : 'Employer / role (optional)'}</label><input id="booking-company" name="company" ${privateTraining ? 'required' : ''} maxlength="200" autocomplete="organization"></div></div>
          ${privateTraining ? `<div class="field agreement-field"><label for="booking-agreement">Approved agreement reference *</label><input id="booking-agreement" name="agreement" required maxlength="100" aria-describedby="agreement-help"><p id="agreement-help">Use the reference provided with your approved training agreement. <a href="contact.html#discovery-form" data-open-modal="discovery">Discuss your requirements</a> if you don’t have one yet.</p></div>` : ''}
          <div class="check booking-consent"><input id="booking-consent" name="consent" type="checkbox" required><label for="booking-consent">I confirm my details and have reviewed the <a href="terms.html">training information</a> and <a href="privacy.html">privacy information</a>. *</label></div>
          <div class="hp" aria-hidden="true"><label for="booking-website">Website</label><input id="booking-website" name="company_website" tabindex="-1" autocomplete="off"></div>
        </fieldset>
      </div><aside class="booking-summary" aria-labelledby="booking-summary-title"><p class="eyebrow">Your training experience</p><h3 id="booking-summary-title" data-summary-title>Half-Day</h3><dl><div><dt>Format</dt><dd>${privateTraining ? 'Private organizational training' : 'Open Enrollment · 1 participant'}</dd></div><div><dt>Training dates</dt><dd data-summary-date>Select an available date</dd></div><div><dt>Session</dt><dd data-summary-session>Choose AM or PM</dd></div></dl>
        ${privateTraining ? `<fieldset class="payment-choices"><legend>Payment preference</legend><label><input type="radio" name="payment" value="deposit" checked> 50% deposit <strong data-deposit-price></strong></label><label><input type="radio" name="payment" value="full"> Pay in full <strong data-full-price></strong></label></fieldset>` : ''}
        <div class="summary-total"><span>${privateTraining ? 'Due at checkout' : 'Program investment'}</span><strong data-summary-price>${privateTraining ? '$1,875' : '$300'}</strong><small>USD${privateTraining ? ' · starting investment' : ' · per person'}</small></div>
        <p class="booking-hint">${privateTraining ? 'Your dates are reserved only after your agreement is approved and the required payment succeeds.' : 'Your registration is confirmed after successful payment. Each cohort welcomes up to 25 participants.'}</p>
        <button class="btn btn-ink booking-submit" type="submit" disabled data-checkout>${privateTraining ? 'Continue to Stripe' : 'Register & Pay'} <span aria-hidden="true">↗</span></button><p class="checkout-caption">Secure payment through Stripe</p>
        <p class="booking-response" role="status" tabindex="-1" data-booking-response hidden></p>
        <a class="booking-help" href="tel:+15015595118">Need a hand? 501-559-5118</a>
      </aside></div>
    </form><noscript><p class="form-intro">Enable JavaScript to view live training dates and register. You can also <a href="tel:+15015595118">call 501-559-5118</a> for booking assistance.</p></noscript></div>
  </section>`;
}

function paymentLinksMarkup(kind) {
  const privateTraining = kind === 'private';
  return `<section class="section bg-ivory booking-section" id="booking" data-payment-links="${kind}"><div class="wrap">
    <div class="booking-heading"><p class="eyebrow">${privateTraining ? 'Training for your organization' : 'Invest in your professional development'}</p><h2 class="section-title">${privateTraining ? 'Choose your training investment' : 'Choose your program'}</h2><p>Select your program${privateTraining ? ' and payment preference' : ''}, then continue to secure payment on Stripe.</p></div>
    <div class="booking-workspace" data-payment-workspace hidden><div class="booking-main"><fieldset class="booking-programs" id="pricing"><legend>Training programs</legend><div class="booking-options direct-programs">${PROGRAMS.map((p, i) => `<label class="booking-option"><input type="radio" name="program" value="${p.id}" ${i === 0 ? 'checked' : ''}><span class="option-content"><span class="option-duration">${p.halfDay ? 'Half-day training' : `${p.days} training ${p.days === 1 ? 'day' : 'days'}`}</span><strong>${p.name}</strong><span>${p.benefit}</span>${privateTraining ? '' : `<span class="option-price">${money(p.enrollment)} <small>/ person</small></span>`}</span></label>`).join('')}</div></fieldset>
    <div class="booking-service-message"><strong>Training dates are arranged with Prestige.</strong><p>Please <a href="mailto:nwimbley@prestigesignaturestandard.com">contact the Academy</a> to confirm availability${privateTraining ? ' and your training agreement' : ''} before paying. This payment does not automatically reserve a date or session.</p></div></div>
    <aside class="booking-summary" aria-labelledby="payment-summary-title"><p class="eyebrow">Your training investment</p><h3 id="payment-summary-title" data-payment-title>Half-Day</h3><p class="booking-hint">${privateTraining ? 'Private organizational training · Up to 25 participants' : 'Open Enrollment · Per person'}</p>
    ${privateTraining ? `<fieldset class="payment-choices"><legend>Payment preference</legend><label><input type="radio" name="payment" value="deposit" checked> 50% deposit <strong data-deposit-price>${money(PROGRAMS[0].private / 2)}</strong></label><label><input type="radio" name="payment" value="full"> Pay in full <strong data-full-price>${money(PROGRAMS[0].private)}</strong></label></fieldset>` : ''}
    <div class="summary-total"><span>Pay on Stripe</span><strong data-payment-price>${money(privateTraining ? PROGRAMS[0].private / 2 : PROGRAMS[0].enrollment)}</strong><small>USD${privateTraining ? ' · starting investment' : ' · per person'}</small></div>
    <a class="btn btn-ink booking-submit" data-payment-link href="${privateTraining ? PROGRAMS[0].links.deposit : PROGRAMS[0].links.enrollment}">Continue to Stripe ↗</a><p class="checkout-caption">Secure checkout on Stripe</p><p class="booking-hint mt-5">Review your program and amount at checkout. For date confirmation${privateTraining ? ' and agreement requirements' : ''}, contact Prestige.</p><a class="booking-help" href="tel:+15015595118">Need a hand? 501-559-5118</a></aside></div>
    <noscript><div class="form-intro"><p>Choose a payment link below. Confirm training availability with Prestige before paying.</p>${PROGRAMS.map(p => `<p><strong>${p.name}</strong> ${privateTraining ? `<a href="${p.links.deposit}">50% deposit — ${money(p.private / 2)}</a> · <a href="${p.links.full}">Pay in full — ${money(p.private)}</a>` : `<a href="${p.links.enrollment}">Pay ${money(p.enrollment)} per person</a>`}</p>`).join('')}</div></noscript>
    </div></section>`;
}
