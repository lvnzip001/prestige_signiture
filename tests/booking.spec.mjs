import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PROGRAMS } from '../assets/js/programs.mjs';
import { bookingMarkup } from '../scripts/booking-markup.mjs';

async function service(page, options = {}) {
  // Exercise the deferred calendar interface independently of the live direct-link mode.
  await page.route(/\/(open-enrollment|private-training)\.html/, async route => {
    const response = await route.fetch();
    const kind = route.request().url().includes('private-training') ? 'private' : 'enrollment';
    const html = (await response.text()).replace(/<section class="section bg-ivory booking-section"[\s\S]*?<\/section>/, bookingMarkup(kind, 'calendar'));
    await route.fulfill({ response, body: html });
  });
  await page.clock.setFixedTime(new Date('2026-09-28T12:00:00Z'));
  const configuration = await readFile('assets/js/booking-config.mjs', 'utf8');
  await page.route('**/assets/js/booking-config.mjs', route => route.fulfill({ contentType: 'text/javascript', body: configuration.replace('availabilityEndpoint: null', "availabilityEndpoint: '/api/availability'").replace('checkoutEndpoint: null', "checkoutEndpoint: '/api/checkout'").replace('statusEndpoint: null', "statusEndpoint: '/api/status'") }));
  await page.route('**/api/availability?**', async route => {
    if (options.fail) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    const url = new URL(route.request().url());
    const p = PROGRAMS.find(p => p.id === url.searchParams.get('program'));
    const slots = ['AM', 'PM'].slice(0, p.halfDay ? 2 : 1).map((session, i) => ({ id: `${p.id}-${session}`, date: '2026-11-02', dates: Array.from({ length: p.days }, (_, n) => `2026-11-0${n+2}`), session: p.halfDay ? session : 'DAY', remaining: options.fullAM && i === 0 ? 0 : 24, status: options.fullAM && i === 0 ? 'full' : 'available', cohort: true, timeLabel: p.halfDay ? `${session} · Central time` : 'Central time' }));
    await route.fulfill({ json: { slots: url.searchParams.get('month') === '2026-11' ? slots : [] } });
  });
}

async function fillDetails(page, kind) {
  await page.locator('#booking-name').fill('Test Participant');
  await page.locator('#booking-email').fill('participant@example.com');
  await page.locator('#booking-phone').fill('5015550100');
  if (kind === 'private') {
    await page.locator('#booking-company').fill('Test Hospitality');
    await page.locator('#booking-agreement').fill('APPROVED-TEST-AGREEMENT');
  }
  await page.locator('#booking-consent').check();
}

for (const p of PROGRAMS) {
  for (const payment of ['enrollment', 'deposit', 'full']) {
    test(`${p.id}: ${payment} carries the selected session to the exact approved Stripe link`, async ({ page }) => {
      await service(page);
      let payload;
      await page.route('**/api/checkout', async route => {
        payload = route.request().postDataJSON();
        await route.fulfill({ json: { checkoutUrl: `${p.links[payment]}?client_reference_id=booking_reference_12345678` } });
      });
      // Never send a payment or customer data to Stripe during local tests.
      await page.route('https://buy.stripe.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Intercepted checkout</h1>' }));
      const kind = payment === 'enrollment' ? 'enrollment' : 'private';
      await page.goto(`/${kind === 'enrollment' ? 'open-enrollment' : 'private-training'}.html?program=${p.id}#booking`);
      await page.getByRole('button', { name: 'Nov 2, 2026, available', exact: true }).click();
      if (p.halfDay) await page.getByRole('button', { name: /PM session/ }).click();
      await expect(page.locator('[data-summary-date]')).toContainText(p.days === 5 ? 'Nov 6, 2026' : p.days === 2 ? 'Nov 3, 2026' : 'Nov 2, 2026');
      if (kind === 'private') await page.locator(`input[name="payment"][value="${payment}"]`).check();
      await fillDetails(page, kind);
      await page.locator('[data-checkout]').click();
      await expect(page).toHaveURL(`${p.links[payment]}?client_reference_id=booking_reference_12345678`);
      expect(payload).toMatchObject({ kind, program: p.id, payment, date: '2026-11-02', session: p.halfDay ? 'PM' : 'DAY' });
      expect(payload).not.toHaveProperty('price');
    });
  }
}

test('calendar mode does not offer a Stripe link before a date is chosen', async ({ page }) => {
  await page.goto('/open-enrollment.html#booking');
  await expect(page.locator('[data-calendar]')).toBeVisible();
  await expect(page.locator('[data-payment-link]')).toHaveCount(0);
  await expect(page.locator('[data-checkout]')).toBeDisabled();
  await expect(page.locator('[data-js-required]')).toHaveCount(0);
  await expect(page.locator('.booking-hint').last()).toContainText('stays pending');
});

test('without JavaScript the calendar asks for it and keeps the phone line', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4175/open-enrollment.html#booking');
  await expect(page.getByText('If the training calendar does not appear')).toBeVisible();
  await expect(page.getByRole('link', { name: 'call 501-559-5118' })).toBeVisible();
  await context.close();
});

test('AM can be full while PM remains available; changing program clears the old selection', async ({ page }) => {
  await service(page, { fullAM: true });
  await page.goto('/open-enrollment.html#booking');
  await page.getByRole('button', { name: 'Nov 2, 2026, available', exact: true }).click();
  await expect(page.getByRole('button', { name: /AM session/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /AM session/ })).toContainText('Full / Closed');
  await page.getByRole('button', { name: /PM session/ }).click();
  await expect(page.locator('[data-checkout]')).toBeEnabled();
  await page.locator('input[value="two-day"]').check();
  await expect(page.locator('[data-checkout]')).toBeDisabled();
  await expect(page.locator('[data-summary-date]')).toHaveText('Select an available date');
  await expect(page.getByRole('button', { name: 'Nov 2, 2026, full / closed', exact: true })).toBeDisabled();
});

test('checkout rejection keeps personal details and refreshes calendar without claiming success', async ({ page }) => {
  await service(page);
  await page.route('**/api/checkout', route => route.fulfill({ status: 409, json: { message: 'This session has just filled. Choose another available session.' } }));
  await page.goto('/open-enrollment.html?program=two-day#booking');
  await page.getByRole('button', { name: 'Nov 2, 2026, available', exact: true }).click();
  await fillDetails(page, 'enrollment');
  await page.locator('[data-checkout]').click();
  await expect(page.locator('[data-booking-response]')).toContainText('just filled');
  await expect(page.locator('#booking-email')).toHaveValue('participant@example.com');
  await expect(page.locator('[data-checkout]')).toBeDisabled();
});

test('availability errors and empty months have usable recovery states', async ({ page }) => {
  await service(page, { fail: true });
  await page.goto('/open-enrollment.html#booking');
  await expect(page.locator('[data-availability-message]')).toContainText('couldn’t load');
  await expect(page.locator('[data-checkout]')).toBeDisabled();
  await page.locator('[data-month-next]').click();
  await expect(page.locator('[data-month-label]')).toHaveText('December 2026');
});

test('booking is usable and accessible on mobile with live session controls', async ({ page }) => {
  await service(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/open-enrollment.html#booking');
  await page.getByRole('button', { name: 'Nov 2, 2026, available', exact: true }).click();
  await page.getByRole('button', { name: /PM session/ }).click();
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('a checkout return does not assert success without server confirmation', async ({ page }) => {
  await page.goto('/booking-confirmation.html?success=true');
  await expect(page.locator('[data-confirmation]')).toContainText('does not by itself confirm');
  await service(page);
  await page.route('**/api/status?**', route => route.fulfill({ json: { status: 'pending' } }));
  await page.goto('/booking-confirmation.html?session_id=cs_test_12345678901234567890');
  await expect(page.locator('[data-confirmation]')).toContainText('still being processed');
});

test('approved artwork is preserved byte-for-byte', async () => {
  expect(createHash('sha256').update(await readFile('assets/images/brand-master.jpg')).digest('hex')).toBe('94772241655e65880ce75bb64b96699b0c5cc208a7fc1da8695a746384e68c57');
});

test('catalogue matches the client-approved amounts and twelve payment links', () => {
  // Independent transcription from Round 2, not values derived from the implementation.
  expect(PROGRAMS.map(p => [p.private / 2, p.private, p.enrollment, p.links.deposit.split('/').pop(), p.links.full.split('/').pop(), p.links.enrollment.split('/').pop()])).toEqual([
    [1875, 3750, 300, '7sY3cvcUCeYqaPG1tX2VG00', '4gMaEX7Ai2bEbTK0pT2VG01', '5kQ6oH8EmcQi0b2c8B2VG08'],
    [3000, 6000, 500, 'eVqeVdaMu2bE1f6dcF2VG02', 'cNiaEX2fY5nQ8HygoR2VG03', 'cNi8wP5sa03wf5W6Oh2VG09'],
    [5000, 10000, 900, '8x214n4o63fIf5WgoR2VG04', '3cI14ng6Og2u0b26Oh2VG05', 'eVq6oHcUC03we1Sc8B2VG0a'],
    [17500, 35000, 3200, '8x2fZhbQy3fI0b2fkN2VG06', 'dRmaEX9Iq2bEf5WdcF2VG07', '00waEX1bU9E60b27Sl2VG0b'],
  ]);
});
