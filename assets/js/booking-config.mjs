// Public configuration only. Credentials and authority over availability belong on the server.
// Null values require the academy's operating rules before Phase 2 activation.
export const BOOKING_CONFIG = Object.freeze({
  paymentMode: 'calendar', // 'payment-links' is the direct Stripe button flow.
  availabilityEndpoint: '/api/availability',
  checkoutEndpoint: '/api/checkout',
  statusEndpoint: '/api/status',
  inquiryEndpoint: null,
  turnstileSiteKey: null, // Set with inquiryEndpoint after the email backend is deployed.
  formSubmitRecipient: 'zluvuno@gmail.com', // Testing inbox. FormSubmit must be activated for this address.
  openingDate: '2026-11-02',
  timeZone: 'America/Chicago',
  trainingWeekdays: [1, 2, 3, 4, 5], // Monday–Friday. The server enforces this.
  sessions: { AM: { start: '09:00', end: '12:00' }, PM: { start: '13:00', end: '16:00' } },
  registrationCutoffHours: 48,
  fiveDayRule: 'training-days',
  agreementVersion: null,
  capacity: 25,
  currency: 'USD',
});
