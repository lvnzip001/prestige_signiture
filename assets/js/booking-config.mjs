// Public configuration only. Credentials and authority over availability belong on the server.
// Null values require the academy's operating rules before Phase 2 activation.
export const BOOKING_CONFIG = Object.freeze({
  paymentMode: 'payment-links', // 'calendar' enables the future integrated booking flow.
  availabilityEndpoint: null,
  checkoutEndpoint: null,
  statusEndpoint: null,
  inquiryEndpoint: null,
  openingDate: '2026-11-02',
  timeZone: 'America/Chicago',
  trainingWeekdays: null, // 0 = Sunday, 6 = Saturday; confirm with Prestige.
  sessions: { AM: { start: null, end: null }, PM: { start: null, end: null } },
  registrationCutoffHours: null,
  fiveDayRule: null, // 'consecutive' or 'training-days'; must match the server.
  agreementVersion: null,
  capacity: 25,
  currency: 'USD',
});
