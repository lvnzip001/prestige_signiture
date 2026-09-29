import { db, json } from '../_shared/client.ts';
import { deliverFormSubmit, formSubmitPayload } from '../_shared/formsubmit.mjs';

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);
  const secret = Deno.env.get('EMAIL_WORKER_SECRET');
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ message: 'Unauthorized' }, 401);
  const client = db();
  const { data: settings, error } = await client.from('email_settings').select('*').single();
  if (error) return json({ message: 'Email settings unavailable' }, 503);
  if (!settings.enabled) return json({ processed: 0, paused: true });
  let processed = 0;
  for (let i = 0; i < 10; i++) {
    const { data: rows, error: claimError } = await client.rpc('claim_email');
    if (claimError) return json({ message: 'Queue unavailable' }, 503);
    const job = rows?.[0];
    if (!job) break;
    const save = async (values: Record<string, unknown>) => {
      const { error } = await client.from('email_outbox').update(values).eq('id', job.id).eq('attempts', job.attempts);
      if (error) throw error;
    };
    try {
      if (job.template_key !== 'inquiry_admin') {
        await save({ state: 'skipped', last_error: 'Only admin inquiry notifications are supported.' });
        continue;
      }
      if (!job.payload) {
        job.payload = formSubmitPayload(job);
        await save({ payload: job.payload });
      }
      const response = await deliverFormSubmit(job.recipient, job.payload, 20000);
      if (response.ok) {
        await save({ state: 'sent', delivery_status: 'accepted', last_error: null });
      } else if (response.activation) {
        await save({ state: 'failed', delivery_status: 'activation_required', last_error: 'FormSubmit sent an activation email. Open that inbox and activate the address before another inquiry is sent.' });
      } else {
        await save({ state: 'failed', last_error: 'FormSubmit did not confirm acceptance. Check inbox activation and provider status before resending.' });
      }
      processed++;
    } catch {
      // FormSubmit has no documented idempotency key: never retry an uncertain send automatically.
      await save({ state: 'failed', last_error: 'Delivery uncertain. Check the admin inbox before resending.' }).catch(() => {});
    }
  }
  return json({ processed });
});
