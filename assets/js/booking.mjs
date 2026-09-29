import { PROGRAMS, money } from './programs.mjs';
import { BOOKING_CONFIG as config } from './booking-config.mjs';

const upArrow = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M4 12 12 4M6.5 4H12v5.5');
  svg.append(path);
  return svg;
};
const labelWithArrow = (element, text) => element.replaceChildren(document.createTextNode(`${text} `), upArrow());
const root = document.querySelector('[data-booking]');
const directPayment = document.querySelector('[data-payment-links]');
if (directPayment) {
  const privateTraining = directPayment.dataset.paymentLinks === 'private';
  const preset = PROGRAMS.find(p => p.id === new URLSearchParams(location.search).get('program'));
  if (preset) directPayment.querySelector(`input[name="program"][value="${preset.id}"]`).checked = true;
  function updatePayment() {
    const p = PROGRAMS.find(p => p.id === directPayment.querySelector('input[name="program"]:checked').value);
    const payment = privateTraining ? directPayment.querySelector('input[name="payment"]:checked').value : 'enrollment';
    const amount = privateTraining ? p.private / (payment === 'deposit' ? 2 : 1) : p.enrollment;
    directPayment.querySelector('[data-payment-title]').textContent = p.name;
    directPayment.querySelector('[data-payment-price]').textContent = money(amount);
    if (privateTraining) {
      directPayment.querySelector('[data-deposit-price]').textContent = money(p.private / 2);
      directPayment.querySelector('[data-full-price]').textContent = money(p.private);
    }
    const link = directPayment.querySelector('[data-payment-link]');
    link.href = p.links[payment];
    labelWithArrow(link, `Pay ${money(amount)}${payment === 'deposit' ? ' deposit' : ''}`);
  }
  directPayment.addEventListener('change', updatePayment);
  updatePayment();
  directPayment.querySelector('[data-payment-workspace]').hidden = false;
}
const formatDate = iso => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
const validDate = iso => typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && Number.isFinite(Date.parse(iso)) && new Date(iso).toISOString().slice(0, 10) === iso;
const functionsOrigin = 'https://nrehqharpjphuwvijket.supabase.co/functions/v1/';
let useFunctionsOrigin;
async function serviceUrl(path) {
  const local = new URL(path, location.origin);
  if (local.origin !== location.origin) throw new Error('Please contact Prestige for assistance.');
  if (useFunctionsOrigin === undefined && (location.hostname === '127.0.0.1' || location.hostname === 'localhost')) {
    try {
      const probe = await fetch(new URL('/api/availability', location.origin), { cache: 'no-store', signal: AbortSignal.timeout(4000) });
      useFunctionsOrigin = !(probe.headers.get('content-type') || '').includes('application/json');
    } catch {
      useFunctionsOrigin = true;
    }
  }
  if (useFunctionsOrigin) return new URL(String(path).replace(/^\/api\//, ''), functionsOrigin);
  return local;
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, signal: AbortSignal.timeout(15000), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Please try again or contact Prestige for assistance.');
  return data;
}

if (root) {
  root.querySelector('[data-js-required]')?.remove();
  const form = root.querySelector('form');
  const kind = root.dataset.booking;
  const $ = selector => root.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const preset = PROGRAMS.find(p => p.id === params.get('program'));
  if (preset) form.elements.program.value = preset.id;
  let program = () => PROGRAMS.find(p => p.id === form.elements.program.value);
  const now = new Date();
  const localToday = new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const firstDate = localToday > config.openingDate ? localToday : config.openingDate;
  const minimumMonth = firstDate.slice(0, 7);
  let month = minimumMonth;
  let selected = null;
  let selectedDate = null;
  let slots = [];
  let openWeeks = new Set();
  let detailMonth = '';
  let weeksReady = false;
  let generation = 0;
  let submitting = false;
  function summary() {
    const p = program();
    $('[data-summary-title]').textContent = p.name;
    $('[data-summary-date]').textContent = selected ? selected.dates.map(formatDate).join(' · ') : 'Select an available date';
    $('[data-summary-session]').textContent = selected ? selected.session === 'DAY' ? 'Full training day' : `${selected.session}${selected.timeLabel ? ` · ${selected.timeLabel}` : ''}` : p.halfDay ? 'Choose AM or PM' : 'Full training days';
    $('[data-duration-hint]').textContent = p.halfDay ? 'Choose a day, then an available AM or PM session. Times are shown in the training location’s time zone.' : `We check the complete ${p.days === 1 ? 'day' : `${p.days}-day training block`} before offering a start date. Every date in the block is shown before you continue.`;
    const price = kind === 'enrollment' ? p.enrollment : p.private / (form.elements.payment.value === 'deposit' ? 2 : 1);
    $('[data-summary-price]').textContent = money(price);
    if (kind === 'private') {
      $('[data-deposit-price]').textContent = money(p.private / 2);
      $('[data-full-price]').textContent = money(p.private);
    }
    $('[data-checkout]').disabled = !selected || !config.checkoutEndpoint || submitting;
    labelWithArrow($('[data-checkout]'), submitting ? 'Checking your selection…' : kind === 'private' ? 'Continue to payment' : `Register & Pay — ${money(price)}`);
  }
  function renderCalendar() {
    const [year, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, m - 1, 1));
    const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
    $('[data-month-label]').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start);
    $('[data-month-prev]').disabled = month <= minimumMonth;
    const calendar = $('[data-calendar]');
    calendar.replaceChildren();
    for (let i = 0; i < start.getUTCDay(); i++) calendar.append(document.createElement('span'));
    for (let day = 1; day <= days; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const available = slots.filter(s => s.date === date && s.status === 'available' && s.remaining > 0);
      const full = slots.some(s => s.date === date && s.status === 'full');
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = !available.length || submitting;
      button.className = 'calendar-day';
      button.setAttribute('aria-label', `${formatDate(date)}${available.length ? ', available' : full ? ', full / closed' : ', unavailable'}`);
      button.setAttribute('aria-pressed', String(selectedDate === date));
      const number = document.createElement('span');
      number.className = 'calendar-num';
      number.textContent = String(day);
      const note = document.createElement('span');
      note.className = 'calendar-note';
      note.setAttribute('aria-hidden', 'true');
      if (available.length && program().halfDay) note.textContent = available.map(slot => slot.session).join(' · ');
      else if (available.length) note.textContent = kind === 'enrollment' ? `${available[0].remaining} open` : 'Open';
      else if (full) note.textContent = 'Full';
      button.append(number, note);
      if (full && !available.length) { button.classList.add('calendar-full'); button.title = 'Full / Closed'; }
      button.addEventListener('click', () => chooseDay(date));
      calendar.append(button);
    }
    renderDateDetail();
  }
  function detailLine(slot) {
    const name = slot.session === 'AM' ? 'Morning' : slot.session === 'PM' ? 'Afternoon' : 'Full day';
    const range = Array.isArray(slot.dates) && slot.dates.length > 1 ? ` · ${slot.dates.map(formatDate).join(', ')}` : '';
    const time = slot.timeLabel ? ` · ${slot.timeLabel}` : '';
    const state = slot.status === 'available' && slot.remaining > 0 ? (kind === 'enrollment' ? `${slot.remaining} of 25 seats open` : 'Open for your team') : slot.status === 'full' ? 'Full' : 'Closed';
    return `${name}${time}${range} · ${state}`;
  }
  const weekdayLong = iso => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const weekdayShort = iso => new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const monthDay = iso => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const slotOpen = slot => slot.status === 'available' && slot.remaining > 0;
  function weekKey(iso) {
    const date = new Date(`${iso}T12:00:00Z`);
    const mondayOffset = date.getUTCDay() === 0 ? -6 : 1 - date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + mondayOffset);
    return date.toISOString().slice(0, 10);
  }
  function renderDateDetail() {
    const list = $('[data-date-detail]');
    list.replaceChildren();
    if (detailMonth !== month) { openWeeks = new Set(); detailMonth = month; weeksReady = false; }
    const byDate = new Map();
    for (const slot of slots) {
      if (!byDate.has(slot.date)) byDate.set(slot.date, []);
      byDate.get(slot.date).push(slot);
    }
    const weeks = new Map();
    for (const [date, daySlots] of byDate) {
      const key = weekKey(date);
      if (!weeks.has(key)) weeks.set(key, []);
      weeks.get(key).push({ date, slots: daySlots, open: daySlots.some(slotOpen) });
    }
    const weekEntries = [...weeks.entries()];
    if (!weeksReady && weekEntries.length) {
      const firstOpen = weekEntries.find(([, days]) => days.some(day => day.open));
      if (firstOpen) openWeeks.add(firstOpen[0]);
      weeksReady = true;
    }
    if (selectedDate && weeks.has(weekKey(selectedDate))) openWeeks.add(weekKey(selectedDate));
    for (const [key, days] of weekEntries) {
      const openDays = days.filter(day => day.open);
      const status = !openDays.length ? 'Full' : openDays.length === days.length && openDays.every(day => day.slots.every(slotOpen)) ? 'Open all week' : `${openDays.length} open · ${openDays.map(day => weekdayShort(day.date)).join(', ')}`;
      const details = document.createElement('details');
      details.className = 'calendar-week';
      if (!openDays.length) details.classList.add('is-full');
      details.open = openWeeks.has(key);
      const summary = document.createElement('summary');
      const range = document.createElement('span');
      range.className = 'calendar-week-range';
      const title = document.createElement('strong');
      title.textContent = days.length === 1 ? monthDay(days[0].date) : `${monthDay(days[0].date)} – ${monthDay(days.at(-1).date)}`;
      const count = document.createElement('span');
      count.textContent = `${days.length} training ${days.length === 1 ? 'day' : 'days'}`;
      range.append(title, count);
      const badge = document.createElement('span');
      badge.className = 'calendar-week-status';
      badge.textContent = status;
      summary.append(range, badge);
      const panel = document.createElement('div');
      panel.className = 'calendar-week-days';
      days.forEach(day => {
        const row = document.createElement(day.open ? 'button' : 'div');
        row.className = 'calendar-detail-row';
        if (day.open) {
          row.type = 'button';
          row.disabled = submitting;
          row.setAttribute('aria-pressed', String(selectedDate === day.date));
          row.addEventListener('click', () => chooseDay(day.date));
        }
        const when = document.createElement('span');
        when.className = 'calendar-detail-date';
        const weekday = document.createElement('strong');
        weekday.textContent = weekdayLong(day.date);
        const sub = document.createElement('span');
        sub.textContent = formatDate(day.date);
        when.append(weekday, sub);
        const body = document.createElement('span');
        body.className = 'calendar-detail-sessions';
        day.slots.forEach(slot => {
          const line = document.createElement('span');
          line.textContent = detailLine(slot);
          if (!slotOpen(slot)) line.className = 'is-full';
          body.append(line);
        });
        row.append(when, body);
        panel.append(row);
      });
      summary.addEventListener('click', event => {
        event.preventDefault();
        details.open = !details.open;
        if (details.open) openWeeks.add(key);
        else openWeeks.delete(key);
      });
      details.append(summary, panel);
      list.append(details);
    }
  }
  function chooseDay(date) {
    selectedDate = date;
    const options = slots.filter(s => s.date === date);
    const container = $('[data-session-options]');
    container.replaceChildren();
    const heading = document.createElement('h4'); heading.textContent = formatDate(date); container.append(heading);
    const choices = document.createElement('div'); choices.className = 'session-choice-grid'; container.append(choices);
    options.forEach(slot => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'session-choice';
      button.disabled = slot.status !== 'available' || slot.remaining < 1 || submitting;
      const title = document.createElement('strong'); title.textContent = slot.session === 'DAY' ? 'Full training day' : `${slot.session} session`;
      const detail = document.createElement('span');
      detail.textContent = button.disabled ? slot.status === 'full' ? 'Full / Closed' : 'Registration closed' : kind === 'enrollment' ? `${slot.remaining} of 25 seats available${slot.cohort ? ' · Join this cohort' : ''}` : 'Available for your team';
      button.append(title, detail);
      if (slot.timeLabel) { const time = document.createElement('span'); time.textContent = slot.timeLabel; button.append(time); }
      button.setAttribute('aria-pressed', String(selected?.id === slot.id));
      button.addEventListener('click', () => { selected = slot; chooseDay(date); summary(); renderCalendar(); });
      choices.append(button);
    });
    if (options.length === 1 && options[0].status === 'available' && options[0].remaining > 0) {
      selected = options[0]; choices.firstChild.setAttribute('aria-pressed', 'true');
    } else if (selected?.date !== date) selected = null;
    summary(); renderCalendar();
    const message = $('[data-availability-message]');
    message.textContent = selected ? 'Your session is selected.' : 'Choose a session for this date.';
    container.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  async function loadAvailability() {
    const token = ++generation;
    slots = []; selected = null; selectedDate = null; $('[data-session-options]').replaceChildren(); summary(); renderCalendar();
    const message = $('[data-availability-message]');
    if (!config.availabilityEndpoint) {
      message.replaceChildren();
      const text = document.createElement('span'); text.textContent = 'For current training availability, ';
      const link = document.createElement('a'); link.href = 'mailto:nwimbley@prestigesignaturestandard.com'; link.textContent = 'contact the Academy';
      message.append(text, link, '. Online dates will appear here when booking opens.');
      return;
    }
    message.textContent = 'Checking training availability…';
    try {
      const url = await serviceUrl(config.availabilityEndpoint);
      url.search = new URLSearchParams({ kind, program: program().id, month }).toString();
      const data = await request(url);
      if (token !== generation) return;
      if (!Array.isArray(data.slots)) throw new Error('Availability could not be loaded. Please contact Prestige.');
      slots = data.slots.filter(s => typeof s.id === 'string' && validDate(s.date) && s.date >= firstDate && s.date.startsWith(month) && ['AM', 'PM', 'DAY'].includes(s.session) && (program().halfDay ? s.session !== 'DAY' : s.session === 'DAY') && Array.isArray(s.dates) && s.dates.length === program().days && s.dates[0] === s.date && s.dates.every(validDate) && Number.isInteger(s.remaining) && s.remaining >= 0 && s.remaining <= config.capacity && ['available', 'full', 'closed'].includes(s.status));
      message.textContent = slots.some(s => s.status === 'available' && s.remaining > 0) ? 'Select an available date to see your session options.' : 'No available starting dates this month. Try another month or contact the Academy.';
      renderCalendar();
    } catch (error) { if (token === generation) message.textContent = 'We couldn’t load current availability. Please try another month or call 501-559-5118.'; }
  }
  for (const [selector, delta] of [['[data-month-prev]', -1], ['[data-month-next]', 1]]) {
    $(selector).addEventListener('click', () => {
      const [y, m] = month.split('-').map(Number);
      month = new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
      loadAvailability();
    });
  }
  form.addEventListener('change', event => {
    $('[data-booking-response]').hidden = true;
    if (event.target.name === 'program') loadAvailability();
    else summary();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !selected || !config.checkoutEndpoint || !form.reportValidity()) return;
    submitting = true; summary();
    const chosenProgram = program();
    const payment = kind === 'private' ? form.elements.payment.value : 'enrollment';
    const payload = { ...Object.fromEntries(new FormData(form)), kind, slotId: selected.id, date: selected.date, session: selected.session, payment };
    // Freeze selection during validation so the displayed summary always matches checkout.
    const controls = [...form.querySelectorAll('input, button')];
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    const notice = $('[data-booking-response]');
    try {
      const data = await request(await serviceUrl(config.checkoutEndpoint), { method: 'POST', body: JSON.stringify(payload) });
      const url = new URL(data.checkoutUrl);
      const approved = new URL(chosenProgram.links[payment]);
      const reference = url.searchParams.get('client_reference_id') || '';
      if (url.origin !== approved.origin || url.pathname !== approved.pathname || !/^[a-zA-Z0-9_-]{16,200}$/.test(reference)) throw new Error('Your booking could not be verified. Please contact Prestige before paying.');
      sessionStorage.setItem('prestige-booking-ref', reference);
      notice.hidden = false;
      notice.textContent = `Your request is pending. Reference ${reference}. Prestige will confirm it after payment is received.`;
      window.setTimeout(() => location.assign(url.href), 900);
    } catch (error) {
      notice.textContent = error.name === 'TimeoutError' ? 'That took too long. Your details are still here. Please try again.' : error.message;
      notice.hidden = false; notice.focus();
      // Revalidate dates after any server rejection; keep entered personal details.
      await loadAvailability();
    } finally {
      submitting = false; controls.forEach((control, i) => { control.disabled = disabled[i]; }); summary(); renderCalendar();
    }
  });
  loadAvailability();
}

const confirmation = document.querySelector('[data-confirmation]');
if (confirmation && config.statusEndpoint) {
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref') || '';
  const session = params.get('session_id');
  serviceUrl(config.statusEndpoint).then(url => {
  if (/^[a-z0-9]{32}$/.test(ref)) url.searchParams.set('ref', ref);
  else if (session && /^cs_[A-Za-z0-9_]{16,250}$/.test(session)) url.searchParams.set('session_id', session);
  if ([...url.searchParams.keys()].length) {
    confirmation.textContent = 'Checking your payment and booking confirmation…';
    request(url).then(data => {
      const messages = { confirmed: 'Your training is confirmed. Prestige will contact you with your training details.', pending: 'Your payment confirmation is still being processed. The request stays pending until Prestige confirms it. Do not make another payment.', review: 'Prestige is reviewing your booking. Please contact the Academy before making another payment.', released: 'This booking was released. The date is available again. Contact Prestige if you still need training.', expired: 'This request has expired. Please return to the training calendar to choose an available date.' };
      confirmation.textContent = messages[data.status] || 'Please contact Prestige to check your booking status.';
    }).catch(() => { confirmation.textContent = 'We couldn’t verify your booking status. Please contact Prestige before making another payment.'; });
  }
  });
}
