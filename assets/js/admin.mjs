import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { PROGRAMS } from './programs.mjs';
import { BOOKING_CONFIG } from './booking-config.mjs';
import { initEmailAdmin } from './admin-email.mjs';
import { postDeskNotice } from './desk-notice.mjs';

const supabase = createClient('https://nrehqharpjphuwvijket.supabase.co', 'sb_publishable_ppqFcB7cMZhYgfd5bCbZZw_DqKHvi7W');
const emailAdmin = initEmailAdmin(supabase);
const $ = selector => document.querySelector(selector);
const login = $('[data-admin-login]');
const rememberedEmailKey = 'prestige-admin-email';
try {
  const remembered = localStorage.getItem(rememberedEmailKey);
  const emailField = login?.querySelector('#admin-email');
  if (remembered && emailField) emailField.value = remembered;
} catch { /* This browser is not keeping a saved email. */ }
const app = $('[data-admin-app]');
const loginStatus = $('[data-admin-login-status]');
const status = $('[data-admin-status]');
const tabs = [...document.querySelectorAll('[data-admin-tab]')];
const panels = [...document.querySelectorAll('[data-admin-panel]')];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const when = value => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(new Date(value)) : '';
const sessions = { AM: 'Morning, 9:00–12:00', PM: 'Afternoon, 1:00–4:00', DAY: 'Full day, 9:00–4:00' };
const payments = { deposit: '50% deposit', full: 'Pay in full', enrollment: 'Open enrollment' };
const statuses = { pending: 'Pending', confirmed: 'Confirmed', expired: 'Expired', released: 'Released' };
const viewCopy = {
  waiting: 'These requests are not confirmed yet. A pending date is held. An expired hold no longer blocks the date, and you can still confirm the payment if it arrived and the session is still open.',
  confirmed: 'Confirmed bookings stay on this desk. The date stays booked until you release it or delete the record.',
  released: 'Released bookings stay here as a record. The date is open again.',
  all: 'Every booking is stored here. Waiting, confirmed, and released are the same record at different points.',
};
const emptyCopy = {
  waiting: 'Nothing is waiting on a payment.',
  confirmed: 'No confirmed bookings yet. A booking moves here when you confirm the payment.',
  released: 'No released bookings.',
  all: 'No requests yet. A booking appears here when someone chooses a date.',
};
let signedInEmail = '';
let bookingRows = [];
let closureRows = [];
let bookingView = 'waiting';
let bookingQuery = '';
const openingMonth = BOOKING_CONFIG.openingDate.slice(0, 7);
const chicagoMonth = new Intl.DateTimeFormat('en-CA', { timeZone: BOOKING_CONFIG.timeZone, year: 'numeric', month: '2-digit' }).format(new Date());
let scheduleMonth = chicagoMonth > openingMonth ? chicagoMonth : openingMonth;

function shortDay(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(year, month - 1, day));
}

function emptyNote(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'admin-empty';
  paragraph.textContent = text;
  return paragraph;
}

function fact(label, value) {
  const term = document.createElement('dt');
  term.textContent = label;
  const detail = document.createElement('dd');
  detail.textContent = value;
  return [term, detail];
}

function note(node, message) {
  node.textContent = message;
}

function showTab(name) {
  tabs.forEach(tab => {
    const selected = tab.dataset.adminTab === name;
    tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => {
    panel.hidden = panel.dataset.adminPanel !== name;
  });
}

async function requireAdmin(session) {
  const email = session.user.email?.toLowerCase() || '';
  const { data, error } = await supabase.from('admins').select('email, must_change_password').eq('email', email).maybeSingle();
  if (error || !data) {
    await supabase.auth.signOut();
    login.hidden = false;
    app.hidden = true;
    note(loginStatus, 'That email is not an academy desk account.');
    return false;
  }
  signedInEmail = email;
  login.hidden = true;
  app.hidden = false;
  $('[data-admin-who]').textContent = email;
  $('[data-admin-reminder]').hidden = !data.must_change_password;
  return true;
}

function inView(booking, view) {
  if (view === 'waiting') return booking.status === 'pending' || booking.status === 'expired';
  if (view === 'all') return true;
  return booking.status === view;
}

function matchesQuery(booking, query) {
  if (!query) return true;
  const program = PROGRAMS.find(item => item.id === booking.program);
  const haystack = [
    booking.contact_name, booking.email, booking.phone, booking.company, booking.agreement,
    booking.reference, program ? program.name : booking.program, ...(booking.dates || []),
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function viewName(status) {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'released') return 'Released';
  return 'Waiting';
}

function sortBookings(rows) {
  const rank = { pending: 0, expired: 1, confirmed: 2, released: 3 };
  return [...rows].sort((a, b) => {
    if (bookingView === 'confirmed') return String(a.dates?.[0] || '').localeCompare(String(b.dates?.[0] || '')) || a.contact_name.localeCompare(b.contact_name);
    if (bookingView === 'released') return new Date(b.updated_at) - new Date(a.updated_at);
    if (bookingView === 'waiting') {
      return (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1)
        || new Date(a.hold_until || a.created_at) - new Date(b.hold_until || b.created_at);
    }
    return rank[a.status] - rank[b.status] || new Date(b.created_at) - new Date(a.created_at);
  });
}

function paintBookings() {
  const copy = $('[data-admin-booking-copy]');
  if (copy) copy.textContent = viewCopy[bookingView];
  document.querySelectorAll('[data-admin-view]').forEach(button => {
    button.setAttribute('aria-checked', button.dataset.adminView === bookingView ? 'true' : 'false');
  });
  const counts = { waiting: 0, confirmed: 0, released: 0, all: bookingRows.length };
  bookingRows.forEach(booking => {
    if (booking.status === 'pending' || booking.status === 'expired') counts.waiting += 1;
    else if (booking.status === 'confirmed' || booking.status === 'released') counts[booking.status] += 1;
  });
  Object.entries(counts).forEach(([name, count]) => {
    const node = document.querySelector(`[data-admin-count="${name}"]`);
    if (node) node.textContent = String(count);
  });
  const badge = $('[data-admin-pending]');
  const pending = bookingRows.filter(booking => booking.status === 'pending').length;
  badge.hidden = !pending;
  badge.textContent = pending ? String(pending) : '';
  const visible = sortBookings(bookingRows.filter(booking => inView(booking, bookingView) && matchesQuery(booking, bookingQuery)));
  const list = $('[data-admin-bookings]');
  list.replaceChildren();
  if (!bookingRows.length) list.append(emptyNote(emptyCopy.all));
  else if (!visible.length) {
    const other = bookingQuery ? bookingRows.find(booking => !inView(booking, bookingView) && matchesQuery(booking, bookingQuery)) : null;
    const message = bookingQuery
      ? `Nothing in this list matches.${other ? ` ${other.contact_name} is under ${viewName(other.status)}.` : ''}`
      : emptyCopy[bookingView];
    list.append(emptyNote(message));
  } else visible.forEach(booking => list.append(bookingCard(booking)));
}

function bookingCard(booking) {
  const article = document.createElement('article');
  article.className = `admin-card${booking.status === 'pending' || booking.status === 'expired' ? ' admin-card-open' : ''}`;
  const top = document.createElement('div');
  top.className = 'admin-card-top';
  const identity = document.createElement('div');
  const program = PROGRAMS.find(item => item.id === booking.program);
  const kicker = document.createElement('p');
  kicker.className = 'admin-kicker';
  kicker.textContent = booking.kind === 'private' ? 'Private training' : 'Open enrollment';
  const title = document.createElement('h3');
  title.textContent = booking.contact_name;
  const programLine = document.createElement('p');
  programLine.className = 'admin-program';
  programLine.textContent = program ? program.name : booking.program;
  identity.append(kicker, title, programLine);
  const pill = document.createElement('p');
  pill.className = `admin-pill admin-pill-${booking.status}`;
  pill.textContent = statuses[booking.status] || booking.status;
  top.append(identity, pill);
  const facts = document.createElement('dl');
  facts.className = 'admin-facts';
  facts.append(
    ...fact('Dates', (booking.dates || []).map(shortDay).join(', ')),
    ...fact('Session', sessions[booking.session] || booking.session),
    ...fact('Payment', `${money(booking.amount_usd)} ${payments[booking.payment] || booking.payment}`),
  );
  if (booking.status === 'pending') facts.append(...fact('Hold until', `${when(booking.hold_until)} Central`));
  if (booking.status === 'expired') facts.append(...fact('Hold ended', `${when(booking.hold_until)} Central`));
  if (booking.status === 'confirmed') facts.append(...fact('Confirmed', `${when(booking.updated_at)} Central`));
  if (booking.status === 'released') facts.append(...fact('Released', `${when(booking.updated_at)} Central`));
  const referenceTerm = document.createElement('dt');
  referenceTerm.textContent = 'Reference';
  const referenceValue = document.createElement('dd');
  const referenceRow = document.createElement('div');
  referenceRow.className = 'admin-ref';
  const referenceText = document.createElement('span');
  referenceText.textContent = booking.reference;
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'admin-copy';
  copy.textContent = 'Copy';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Select the reference';
    }
  });
  referenceRow.append(referenceText, copy);
  referenceValue.append(referenceRow);
  facts.append(referenceTerm, referenceValue);
  const person = document.createElement('div');
  person.className = 'admin-person';
  if (booking.email) {
    const email = document.createElement('a');
    email.href = `mailto:${booking.email}`;
    email.textContent = booking.email;
    person.append(email);
  }
  if (booking.phone) {
    const phone = document.createElement('a');
    phone.href = `tel:${booking.phone}`;
    phone.textContent = booking.phone;
    person.append(phone);
  }
  if (booking.company) {
    const company = document.createElement('span');
    company.textContent = booking.company;
    person.append(company);
  }
  if (booking.agreement) {
    const agreement = document.createElement('span');
    agreement.textContent = `Agreement ${booking.agreement}`;
    person.append(agreement);
  }
  const actions = document.createElement('div');
  actions.className = 'admin-actions';
  const personLabel = booking.contact_name;
  if (['pending', 'expired'].includes(booking.status)) {
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'btn btn-ink';
    confirm.textContent = 'Confirm payment';
    confirm.addEventListener('click', () => {
      if (!window.confirm(`Confirm payment for ${personLabel}? Check Stripe for reference ${booking.reference} first. The date stays booked.`)) return;
      confirmPayment(booking);
    });
    actions.append(confirm);
  }
  if (['pending', 'confirmed', 'expired'].includes(booking.status)) {
    const release = document.createElement('button');
    release.type = 'button';
    release.className = 'btn btn-ghost-ink';
    release.textContent = 'Release date';
    release.addEventListener('click', () => {
      const warning = booking.status === 'confirmed'
        ? `Release ${personLabel}? This booking is already confirmed. The date opens again, and the record stays under Released.`
        : `Release ${personLabel}? The date opens again, and the record stays under Released.`;
      if (!window.confirm(warning)) return;
      act('release_booking', booking.id, 'Date released. The record is under Released.');
    });
    actions.append(release);
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'btn btn-ghost-ink';
  remove.textContent = 'Delete booking';
  remove.addEventListener('click', () => {
    if (!window.confirm(`Delete ${personLabel}? The record is removed and the date becomes available.`)) return;
    act('delete_booking', booking.id, 'Booking deleted.');
  });
  actions.append(remove);
  article.append(top, facts, person, actions);
  return article;
}

function showIssued(email, password, verb) {
  const box = $('[data-admin-issued]');
  box.hidden = false;
  box.replaceChildren();
  const copy = document.createElement('p');
  copy.textContent = `${verb} ${email}. Pass on this starting password. It is shown only here.`;
  const secret = document.createElement('p');
  secret.className = 'admin-issued-secret';
  secret.textContent = password;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-ghost-ink';
  button.textContent = 'Copy password';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(password);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select the password above';
    }
  });
  box.append(copy, secret, button);
}

async function team(action, email) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('/api/admin-team', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify({ action, email }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The desk could not do that.');
  return data;
}

function teamCard(admin) {
  const article = document.createElement('article');
  article.className = 'admin-row';
  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = admin.email;
  body.append(title);
  const actions = document.createElement('div');
  actions.className = 'admin-actions';
  if (admin.email === signedInEmail) {
    const self = document.createElement('p');
    self.textContent = 'Signed in now.';
    body.append(self);
    const change = document.createElement('button');
    change.type = 'button';
    change.className = 'btn btn-ghost-ink';
    change.textContent = 'Change password';
    change.addEventListener('click', () => showTab('account'));
    actions.append(change);
  } else {
    if (admin.mustChangePassword) {
      const reminder = document.createElement('p');
      reminder.textContent = 'Starting password still in use.';
      body.append(reminder);
    }
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn-ink';
    reset.textContent = 'New starting password';
    reset.addEventListener('click', () => resetAdmin(admin.email));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-ghost-ink';
    remove.textContent = 'Remove admin';
    remove.addEventListener('click', () => removeAdmin(admin.email));
    actions.append(reset, remove);
  }
  article.append(body, actions);
  return article;
}

function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1 + delta, 1)).toISOString().slice(0, 7);
}

function monthLabel(month) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
}

function weekdayDates(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const dates = [];
  for (let day = 1; day <= count; day += 1) {
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    if (iso < BOOKING_CONFIG.openingDate) continue;
    const weekday = new Date(`${iso}T12:00:00Z`).getUTCDay();
    if (!BOOKING_CONFIG.trainingWeekdays.includes(weekday)) continue;
    dates.push(iso);
  }
  return dates;
}

function liveBooking(booking) {
  return booking.status === 'confirmed' || (booking.status === 'pending' && booking.hold_until && new Date(booking.hold_until) > new Date());
}

function onPart(iso, part) {
  return bookingRows.filter(booking => liveBooking(booking) && (booking.dates || []).includes(iso) && (booking.session === 'DAY' || booking.session === part));
}

function cohortCount(booking) {
  const dates = JSON.stringify(booking.dates || []);
  return bookingRows.filter(item => liveBooking(item) && item.kind === 'enrollment' && item.program === booking.program && item.session === booking.session && JSON.stringify(item.dates || []) === dates).length;
}

function quiet(text) {
  const paragraph = document.createElement('p');
  paragraph.className = 'admin-slot-open';
  paragraph.textContent = text;
  return paragraph;
}

function personSlot(booking) {
  const block = document.createElement('p');
  block.className = 'admin-slot';
  const name = document.createElement('strong');
  name.textContent = booking.contact_name;
  const detail = document.createElement('span');
  const program = PROGRAMS.find(item => item.id === booking.program);
  const seats = booking.kind === 'enrollment' ? `, ${cohortCount(booking)} of ${BOOKING_CONFIG.capacity}` : '';
  detail.textContent = `${booking.status === 'confirmed' ? 'Confirmed' : 'Pending'} · ${booking.kind === 'private' ? 'Private' : 'Open enrollment'} ${program ? program.name : booking.program}${seats}`;
  if (booking.status === 'pending') detail.classList.add('admin-slot-pending');
  block.append(name, detail);
  return block;
}

function reopenButton(item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-ghost-ink';
  button.textContent = 'Reopen';
  button.addEventListener('click', () => act('reopen_date', item.id));
  return button;
}

function sessionCell(iso, part) {
  const cell = document.createElement('td');
  const own = closureRows.find(item => item.closed_on === iso && item.session === part);
  const dayClosed = closureRows.find(item => item.closed_on === iso && item.session === 'DAY');
  if (own) {
    cell.append(quiet(own.note ? `Closed. ${own.note}` : 'Closed'), reopenButton(own));
  } else if (dayClosed) cell.append(quiet('Closed with the full day'));
  onPart(iso, part).forEach(booking => cell.append(personSlot(booking)));
  if (!cell.childNodes.length) cell.append(quiet('Open'));
  return cell;
}

function fullDayCell(iso) {
  const cell = document.createElement('td');
  const dayClosed = closureRows.find(item => item.closed_on === iso && item.session === 'DAY');
  if (dayClosed) cell.append(quiet(dayClosed.note ? `Closed. ${dayClosed.note}` : 'Closed'), reopenButton(dayClosed));
  bookingRows.filter(booking => liveBooking(booking) && booking.session === 'DAY' && (booking.dates || []).includes(iso)).forEach(booking => cell.append(personSlot(booking)));
  const notes = ['AM', 'PM'].flatMap(part => {
    if (closureRows.some(item => item.closed_on === iso && item.session === part)) return [part === 'AM' ? 'Morning is closed' : 'Afternoon is closed'];
    if (onPart(iso, part).some(booking => booking.session !== 'DAY')) return [part === 'AM' ? 'Morning is booked' : 'Afternoon is booked'];
    return [];
  });
  if (!dayClosed && notes.length) cell.append(quiet(notes.join('. ')));
  if (!cell.childNodes.length) cell.append(quiet('Open'));
  return cell;
}

function paintSchedule(failed = false) {
  const label = monthLabel(scheduleMonth);
  $('[data-admin-month-label]').textContent = label;
  $('[data-admin-month-caption]').textContent = label;
  $('[data-admin-month-prev]').disabled = scheduleMonth <= openingMonth;
  const body = $('[data-admin-schedule]');
  body.replaceChildren();
  if (failed) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.append(quiet('The date table could not be loaded.'));
    row.append(cell);
    body.append(row);
    return;
  }
  weekdayDates(scheduleMonth).forEach(iso => {
    const row = document.createElement('tr');
    const date = document.createElement('th');
    date.scope = 'row';
    date.textContent = shortDay(iso);
    row.append(date, sessionCell(iso, 'AM'), sessionCell(iso, 'PM'), fullDayCell(iso));
    body.append(row);
  });
}

async function loadTeam() {
  const list = $('[data-admin-team]');
  try {
    const data = await team('list');
    list.replaceChildren();
    (data.admins || []).forEach(admin => list.append(teamCard(admin)));
  } catch (error) {
    list.replaceChildren(emptyNote(error.message));
  }
}

async function load() {
  const [{ data: bookings, error: bookingError }, { data: closures, error: closureError }, { data: hold }] = await Promise.all([
    supabase.from('bookings').select('id, reference, program, kind, dates, session, payment, amount_usd, contact_name, email, phone, company, agreement, status, hold_until, created_at, updated_at').order('created_at', { ascending: false }),
    supabase.from('closures').select('id, closed_on, session, note').order('closed_on'),
    supabase.from('settings').select('value').eq('key', 'hold_hours').maybeSingle(),
  ]);
  if (hold?.value) $('[data-admin-hold] [name="hours"]').value = hold.value;
  const list = $('[data-admin-bookings]');
  if (bookingError) {
    bookingRows = [];
    list.replaceChildren(emptyNote('The booking list could not be loaded.'));
  } else {
    bookingRows = bookings || [];
    paintBookings();
  }
  closureRows = closureError ? [] : (closures || []);
  paintSchedule(Boolean(bookingError || closureError));
  const closed = $('[data-admin-closures]');
  closed.replaceChildren();
  if (closureError) closed.append(emptyNote('The closed dates could not be loaded.'));
  else if (!(closures || []).length) closed.append(emptyNote('No dates are closed.'));
  else (closures || []).forEach(item => {
    const row = document.createElement('article');
    row.className = 'admin-row';
    const body = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = shortDay(item.closed_on);
    const session = document.createElement('p');
    session.textContent = sessions[item.session] || item.session;
    body.append(title, session);
    if (item.note) {
      const noteLine = document.createElement('p');
      noteLine.textContent = item.note;
      body.append(noteLine);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-ghost-ink';
    button.textContent = 'Reopen';
    button.addEventListener('click', () => act('reopen_date', item.id));
    row.append(body, button);
    closed.append(row);
  });
  await loadTeam();
  await emailAdmin.load();
}

async function confirmPayment(booking) {
  const { error } = await supabase.rpc('confirm_booking', { p_id: booking.id });
  if (error) {
    note(status, error.message);
    return;
  }
  let sent = false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) sent = await postDeskNotice(session.access_token, booking.id);
  } catch { sent = false; }
  note(status, sent ? 'Payment confirmed. The notice is in the academy inbox.' : 'Payment confirmed. It is now under Confirmed.');
  await load();
}

async function act(fn, id, success = 'Saved.') {
  const { error } = await supabase.rpc(fn, { p_id: id });
  note(status, error ? error.message : success);
  await load();
}

async function resetAdmin(email) {
  try {
    const data = await team('reset', email);
    showIssued(data.email, data.password, 'New starting password for');
    note(status, 'Starting password ready.');
    await loadTeam();
  } catch (error) {
    note(status, error.message);
  }
}

async function removeAdmin(email) {
  if (!window.confirm(`Remove ${email} from the booking desk? They will not be able to sign in.`)) return;
  try {
    await team('delete', email);
    note(status, `${email} was removed.`);
    await loadTeam();
  } catch (error) {
    note(status, error.message);
  }
}

document.querySelectorAll('[data-admin-view]').forEach(button => {
  button.addEventListener('click', () => {
    bookingView = button.dataset.adminView;
    paintBookings();
  });
});

$('[data-admin-month-prev]').addEventListener('click', () => {
  if (scheduleMonth <= openingMonth) return;
  scheduleMonth = shiftMonth(scheduleMonth, -1);
  paintSchedule();
});

$('[data-admin-month-next]').addEventListener('click', () => {
  scheduleMonth = shiftMonth(scheduleMonth, 1);
  paintSchedule();
});

$('[data-admin-search]').addEventListener('input', event => {
  bookingQuery = event.target.value.trim().toLowerCase();
  paintBookings();
});

$('[data-admin-reminder-go]').addEventListener('click', () => showTab('account'));

tabs.forEach(tab => {
  tab.addEventListener('click', () => showTab(tab.dataset.adminTab));
  tab.addEventListener('keydown', event => {
    const names = ['ArrowRight', 'ArrowLeft'];
    if (!names.includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    showTab(next.dataset.adminTab);
  });
});

login.addEventListener('submit', async event => {
  event.preventDefault();
  const values = new FormData(login);
  const email = String(values.get('email') || '').trim();
  const password = String(values.get('password') || '');
  note(loginStatus, '');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    note(loginStatus, 'That email or password was not accepted.');
    return;
  }
  try { localStorage.setItem(rememberedEmailKey, email); } catch { /* Sign-in still succeeds if this browser cannot save the email. */ }
});

$('[data-admin-signout]').addEventListener('click', async () => {
  await supabase.auth.signOut();
  app.hidden = true;
  login.hidden = false;
  signedInEmail = '';
  $('[data-admin-issued]').hidden = true;
  $('[data-admin-issued]').replaceChildren();
  showTab('bookings');
});

$('[data-admin-password]').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const password = String(new FormData(form).get('password') || '');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    note(status, 'The password could not be saved. Use at least 8 characters, and choose one that is different from the current password.');
    return;
  }
  const { error: reminderError } = await supabase.rpc('clear_password_reminder');
  $('[data-admin-reminder]').hidden = !reminderError;
  note(status, reminderError ? 'The password is saved. The reminder could not be cleared.' : 'The new password is saved.');
  form.reset();
  await loadTeam();
});

$('[data-admin-create]').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = String(new FormData(form).get('email') || '').trim();
  try {
    const data = await team('create', email);
    showIssued(data.email, data.password, 'Admin created for');
    note(status, 'Admin created.');
    form.reset();
    await loadTeam();
  } catch (error) {
    note(status, error.message);
  }
});

$('[data-admin-hold]').addEventListener('submit', async event => {
  event.preventDefault();
  const hours = Number(new FormData(event.currentTarget).get('hours'));
  const { error } = await supabase.rpc('set_hold_hours', { p_hours: hours });
  note(status, error ? error.message : `New requests now hold a date for ${hours} hours.`);
  await load();
});

$('[data-admin-close]').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const { error } = await supabase.rpc('close_date', {
    p_date: values.get('date'),
    p_session: values.get('session'),
    p_note: values.get('note') || '',
  });
  note(status, error ? error.message : 'Date closed.');
  if (!error) form.reset();
  await load();
});

const { data: { session } } = await supabase.auth.getSession();
if (session && await requireAdmin(session)) await load();
supabase.auth.onAuthStateChange(async (_event, next) => {
  if (next && await requireAdmin(next)) await load();
});
