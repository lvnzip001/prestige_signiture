export function initEmailAdmin(supabase) {
  const form = document.querySelector('[data-email-settings]');
  const message = document.querySelector('[data-email-status]');
  const list = document.querySelector('[data-email-log]');
  const report = text => { message.textContent = text; };
  const when = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(new Date(value));
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
  function fact(label, value) {
    const term = document.createElement('dt'); term.textContent = label;
    const detail = document.createElement('dd'); detail.textContent = value;
    return [term, detail];
  }
  function paint(rows) {
    list.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty';
      empty.textContent = 'No inquiries yet.';
      list.append(empty);
      return;
    }
    for (const item of rows) {
      const details = item.details || {};
      const name = details.name || 'Inquiry';
      const card = document.createElement('article');
      card.className = 'admin-card';
      const top = document.createElement('div'); top.className = 'admin-card-top';
      const person = document.createElement('div');
      const program = document.createElement('p'); program.className = 'admin-program'; program.textContent = details.training_interest || 'Training inquiry';
      const heading = document.createElement('h3'); heading.textContent = name;
      const place = document.createElement('p'); place.textContent = [details.company, details.city_state].filter(Boolean).join(' · ');
      person.append(program, heading, place);
      const time = document.createElement('p'); time.className = 'admin-pill'; time.textContent = when(item.created_at);
      top.append(person, time);
      const facts = document.createElement('dl'); facts.className = 'admin-facts';
      facts.append(...fact('Email', details.email || item.email || ''));
      facts.append(...fact('Phone', details.phone || ''));
      if (details.industry) facts.append(...fact('Industry', details.industry));
      if (details.employee_count) facts.append(...fact('People', details.employee_count));
      if (details.desired_timing) facts.append(...fact('Timing', details.desired_timing));
      if (details.title) facts.append(...fact('Title', details.title));
      card.append(top, facts);
      if (details.service_challenge) {
        const note = document.createElement('p');
        note.textContent = details.service_challenge;
        card.append(note);
      }
      const actions = document.createElement('div'); actions.className = 'admin-actions';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-ghost-ink';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete inquiry from ${name}`);
      remove.addEventListener('click', async () => {
        if (!window.confirm(`Delete the inquiry from ${name}? It will leave this list.`)) return;
        remove.disabled = true;
        const { error } = await supabase.rpc('delete_inquiry', { p_id: item.id });
        if (error) {
          report('That inquiry could not be deleted.');
          remove.disabled = false;
          return;
        }
        card.remove();
        if (!list.querySelector('.admin-card')) paint([]);
        report('Inquiry deleted.');
      });
      actions.append(remove);
      card.append(actions);
      list.append(card);
    }
  }
  async function load() {
    try {
      const { data, error } = await supabase.from('email_settings').select('notification_to, enabled').single();
      if (error || !data) throw new Error('setup');
      form.querySelector('fieldset').disabled = false;
      form.elements.notification_to.value = data.notification_to;
      report(data.enabled ? 'Inquiry notifications are enabled.' : 'Website inquiries are sent to this address and listed below.');
      const inquiries = await supabase.from('inquiries').select('id,email,details,created_at').order('created_at', { ascending: false });
      if (inquiries.error) {
        list.textContent = 'Inquiries could not be loaded.';
        return;
      }
      paint(inquiries.data || []);
    } catch {
      form.querySelector('fieldset').disabled = true;
      report('Email setup is not available. Apply the email migrations in Supabase, then refresh.');
    }
  }
  document.querySelector('[data-email-refresh]').addEventListener('click', load);
  return { load };
}
