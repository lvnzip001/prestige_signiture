export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function renderEmail(template, variables, settings, from) {
  const render = value => value.replace(/{{(\w+)}}/g, (_, key) => String(variables[key] ?? ''));
  const subject = render(template.subject).replace(/[\r\n]/g, ' ').slice(0, 200);
  const text = `${render(template.body)}\n\nThe Prestige Signature Standard Academy\n501-559-5118\n${settings.reply_to}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#f4efe5"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tr><td bgcolor="#171512" style="background-color:#171512;padding-top:24px;padding-bottom:24px;padding-left:24px;padding-right:24px;font-family:Georgia,serif;font-size:22px;line-height:30px;color:#e8dfd0">The Prestige Signature Standard Academy</td></tr><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:24px;padding-bottom:24px;padding-left:24px;padding-right:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#171512">${escapeHtml(text).replace(/\n/g, '<br>')}</td></tr></table></td></tr></table></body></html>`;
  return { from: `${settings.sender_name} <${from}>`, subject, text, html, reply_to: settings.reply_to };
}

export function validateInquiry(body) {
  if (!body || body.company_website || !['yes', true, 'on'].includes(body.consent)) throw new Error('Check the details and consent.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId || '')) throw new Error('Invalid request. Please reload.');
  const required = ['name', 'company', 'email', 'phone', 'industry', 'employee_count', 'city_state', 'training_interest', 'desired_timing'];
  const optional = ['title', 'service_challenge', 'source_page', 'utm_source', 'utm_medium', 'utm_campaign'];
  const details = {};
  for (const key of [...required, ...optional]) {
    const value = String(body[key] ?? '').trim();
    if (required.includes(key) && !value || value.length > (key === 'service_challenge' ? 1200 : 254)) throw new Error('Check the required fields and their length.');
    details[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) || !/^[1-9]\d{0,5}$/.test(details.employee_count)) throw new Error('Check your email and employee count.');
  return details;
}
