import { DESK_NOTICES } from './desk-notice.mjs';

export const ACADEMY_SITE = 'https://prestigesignaturestandard.com';

const inquiryLabels = { name: 'Name', company: 'Organization', title: 'Title', email: 'Email', phone: 'Phone', industry: 'Industry', employee_count: 'People to train', city_state: 'City / State', training_interest: 'Training interest', desired_timing: 'Desired timing', service_challenge: 'Service challenge' };

export function inquiryDetailsText(details) {
  return Object.entries(inquiryLabels).map(([key, label]) => {
    const value = String(details?.[key] ?? '').trim();
    return value ? `${label}: ${value}` : '';
  }).filter(Boolean).join('\n');
}

// Construct a fixed payload, never forwarding client-controlled FormSubmit options.
export function formSubmitPayload(job) {
  return {
    _subject: DESK_NOTICES.inquiry,
    _template: 'table',
    name: job.variables.name,
    inquiry: job.variables.details,
    reference: job.event_key,
  };
}

export async function deliverFormSubmit(recipient, payload, timeout = 8000) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      origin: ACADEMY_SITE,
      referer: `${ACADEMY_SITE}/contact.html`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeout),
  });
  const result = await response.json().catch(() => ({}));
  return { ok: response.ok && formSubmitAccepted(result), activation: formSubmitNeedsActivation(result), result };
}
export function formSubmitAccepted(result) {
  return result?.success === true || result?.success === 'true';
}
export function formSubmitNeedsActivation(result) {
  return /needs activation/i.test(String(result?.message || ''));
}
