import { DESK_NOTICES } from './desk-notice.mjs';

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
export function formSubmitAccepted(result) {
  return result?.success === true || result?.success === 'true';
}
export function formSubmitNeedsActivation(result) {
  return /needs activation/i.test(String(result?.message || ''));
}
