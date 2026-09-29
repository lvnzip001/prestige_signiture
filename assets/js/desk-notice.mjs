export const DESK_NOTICES = {
  inquiry: 'Prestige Academy — New discovery inquiry',
  enrollment: 'Prestige Academy — New open enrollment',
  payment: 'Prestige Academy — New training payment',
  confirmed: 'Prestige Academy — Payment confirmed',
};

const programs = {
  'half-day': 'Half-Day',
  'full-day': 'Full-Day',
  'two-day': 'Two-Day Signature',
  'full-academy': 'Five-Day Full Academy',
};
const sessions = { AM: 'Morning, 9:00–12:00', PM: 'Afternoon, 1:00–4:00', DAY: 'Full day, 9:00–4:00' };
const payments = { deposit: '50% deposit', full: 'Pay in full', enrollment: 'Open enrollment' };

export function bookingNoticeText(booking, confirmed = false) {
  const dates = Array.isArray(booking.dates) ? booking.dates.join(', ') : '';
  return [
    `Training: ${programs[booking.program] || booking.program || ''}`,
    dates ? `Dates: ${dates}` : '',
    `Session: ${sessions[booking.session] || booking.session || ''}`,
    `Payment: ${payments[booking.payment] || booking.payment || ''}`,
    Number.isFinite(Number(booking.amount_usd)) ? `Amount: $${Number(booking.amount_usd)}` : '',
    `Status: ${confirmed ? 'Payment confirmed on the academy desk' : 'Pending until Prestige confirms the payment'}`,
    `Name: ${booking.contact_name || ''}`,
    `Email: ${booking.email || ''}`,
    `Phone: ${booking.phone || ''}`,
    booking.company ? `Company: ${booking.company}` : '',
    'Desk: https://prestigesignaturestandard.com/admin.html',
  ].filter(Boolean).join('\n');
}

export function deskNoticePayload(kind, { name, details, reference }) {
  const subject = DESK_NOTICES[kind];
  if (!subject) throw new Error('Unknown notice');
  return {
    _subject: subject,
    _template: 'table',
    name: String(name || 'Prestige').replace(/[\r\n]/g, ' ').slice(0, 160),
    details: String(details || '').replace(/\r/g, '').slice(0, 4000),
    reference: String(reference || '').replace(/[\r\n]/g, '').slice(0, 80),
  };
}

export async function postDeskNotice(recipient, kind, booking) {
  const payload = deskNoticePayload(kind, {
    name: booking.contact_name,
    details: bookingNoticeText(booking, kind === 'confirmed'),
    reference: booking.reference,
  });
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  return result.success === true || result.success === 'true';
}
