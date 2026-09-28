export function initEmailAdmin(supabase) {
  const form = document.querySelector('[data-email-settings]');
  const message = document.querySelector('[data-email-status]');
  const report = text => { message.textContent = text; };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button'); button.disabled = true;
    try {
      const notification_to = form.elements.notification_to.value.trim();
      const { error } = await supabase.from('email_settings').update({ notification_to }).eq('id', true).select('notification_to').single();
      report(error ? 'The email address could not be saved. Check your admin access and setup.' : 'Saved. New inquiries will use this address. Check the inbox for FormSubmit activation when first used.');
    } catch { report('Connection failed. Your changes have not been saved.'); }
    finally { button.disabled = false; }
  });
  async function load() {
    try {
      const { data, error } = await supabase.from('email_settings').select('notification_to, enabled').single();
      if (error || !data) throw new Error('setup');
      form.querySelector('fieldset').disabled = false;
      form.elements.notification_to.value = data.notification_to;
      report(data.enabled ? 'Inquiry notifications are enabled.' : 'Email address ready. Delivery will start after setup is completed.');
      const log = await supabase.from('email_outbox').select('created_at,recipient,state,delivery_status,last_error').order('created_at', { ascending: false }).limit(30);
      const list = document.querySelector('[data-email-log]'); list.replaceChildren();
      if (log.error) { list.textContent = 'Notification activity could not be loaded.'; return; }
      for (const item of log.data || []) {
        const row = document.createElement('p'); row.className = 'admin-empty';
        row.textContent = `${new Date(item.created_at).toLocaleString()} · ${item.recipient} · ${item.delivery_status || item.state}${item.last_error ? ` · ${item.last_error}` : ''}`;
        list.append(row);
      }
      if (!log.data?.length) list.textContent = 'No inquiries queued yet.';
    } catch {
      form.querySelector('fieldset').disabled = true;
      report('Email setup is not available. Apply the email migrations in Supabase, then refresh.');
    }
  }
  document.querySelector('[data-email-refresh]').addEventListener('click', load);
  return { load };
}
