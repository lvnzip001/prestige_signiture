import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formSubmitPayload, formSubmitAccepted, formSubmitNeedsActivation } from '../supabase/functions/_shared/formsubmit.mjs';
import { DESK_NOTICES as serverNotices, bookingNoticeText, deskNoticePayload } from '../supabase/functions/_shared/desk-notice.mjs';
import { DESK_NOTICES as siteNotices } from '../assets/js/desk-notice.mjs';
test('FormSubmit sends only admin notification fields without autoresponse or recipient overrides', () => {
  const payload = formSubmitPayload({event_key:'inquiry:admin',variables:{name:'Visitor',details:'Message',_cc:'someone@example.com',_autoresponse:'Unwanted'}});
  assert.equal(payload.reference, 'inquiry:admin');
  assert.equal(payload.inquiry, 'Message');
  assert.equal(payload._autoresponse, undefined);
  assert.equal(payload._cc, undefined);
  assert.equal(payload._captcha, undefined);
  assert.equal(payload._subject, 'Prestige Academy — New discovery inquiry');
  assert.equal(formSubmitAccepted({success:'true'}), true);
  assert.equal(formSubmitAccepted({success:'false'}), false);
  assert.equal(formSubmitAccepted({}), false);
  assert.equal(formSubmitNeedsActivation({success:'false', message:"This form needs Activation. We've sent you an email containing an 'Activate Form' link."}), true);
  assert.equal(formSubmitNeedsActivation({success:'false', message:'Server Error'}), false);
  const booking = { program: 'two-day', dates: ['2026-11-04', '2026-11-05'], session: 'DAY', payment: 'enrollment', amount_usd: 2400, contact_name: 'Guest', email: 'guest@example.com', phone: '501-559-5118', company: 'Harbor' };
  const enrollment = deskNoticePayload('enrollment', { name: 'Guest', details: bookingNoticeText(booking), reference: 'abc123' });
  assert.equal(enrollment._subject, 'Prestige Academy — New open enrollment');
  assert.equal(enrollment._cc, undefined);
  assert.equal(enrollment._autoresponse, undefined);
  assert.match(enrollment.details, /Two-Day Signature/);
  assert.match(enrollment.details, /Pending until Prestige confirms the payment/);
  assert.match(enrollment.details, /https:\/\/prestigesignaturestandard.com\/admin.html/);
  assert.equal(deskNoticePayload('payment', { name: 'Guest', details: 'Deposit', reference: 'abc123' })._subject, serverNotices.payment);
  assert.equal(deskNoticePayload('confirmed', { name: 'Guest', details: bookingNoticeText(booking, true), reference: 'abc123' })._subject, 'Prestige Academy — Payment confirmed');
  assert.deepEqual(serverNotices, siteNotices);
});
import { renderEmail, validateInquiry } from '../supabase/functions/_shared/email.mjs';
test('email treats customer content as text and prevents subject line injection', () => {
  const result = renderEmail({subject:'Hello {{name}}',body:'{{details}}'}, {name:'A\r\nB',details:'<script>alert(1)</script>\n{{name}}'}, {sender_name:'Prestige',reply_to:'desk@example.com'}, 'bookings@example.com');
  assert.equal(result.subject, 'Hello A  B');
  assert.ok(!result.html.includes('<script>'));
  assert.ok(result.html.includes('&lt;script&gt;'));
  assert.ok(result.text.includes('{{name}}')); // No recursive substitution of user input.
});
const valid = {requestId:'550e8400-e29b-41d4-a716-446655440000',consent:'yes',name:'Test',company:'Company',email:'test@example.com',phone:'123456789',industry:'Hotel',employee_count:'2',city_state:'Bryant',training_interest:'Half-Day',desired_timing:'November'};
test('inquiry validates consent, email, quantities, honeypot and length', () => {
  assert.equal(validateInquiry(valid).name,'Test');
  for (const patch of [{consent:false},{email:'invalid'},{employee_count:'0'},{employee_count:'2.5'},{company_website:'spam'},{name:' '},{service_challenge:'x'.repeat(1201)},{requestId:'invalid'}]) assert.throws(()=>validateInquiry({...valid,...patch}));
});
