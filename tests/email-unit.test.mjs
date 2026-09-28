import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formSubmitPayload, formSubmitAccepted } from '../supabase/functions/_shared/formsubmit.mjs';
test('FormSubmit sends only admin notification fields without autoresponse or recipient overrides', () => {
  const payload = formSubmitPayload({event_key:'inquiry:admin',variables:{name:'Visitor',details:'Message',_cc:'someone@example.com',_autoresponse:'Unwanted'}});
  assert.equal(payload.reference, 'inquiry:admin');
  assert.equal(payload.inquiry, 'Message');
  assert.equal(payload._autoresponse, undefined);
  assert.equal(payload._cc, undefined);
  assert.equal(payload._captcha, undefined);
  assert.equal(formSubmitAccepted({success:'true'}), true);
  assert.equal(formSubmitAccepted({success:'false'}), false);
  assert.equal(formSubmitAccepted({}), false);
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
