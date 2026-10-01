import { test, expect, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [1280,1366,1440,1920]) {
  test(`desktop header exposes seven links and full menu at ${width}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const links=page.locator('.desktop-nav > .nav-link, .desktop-nav > .nav-item > .nav-link');
    await expect(links).toHaveText(['Home','Training Programs','The P.O.I.S.E. Method™','Who We Serve','Credential','About','Open Enrollment']);
    await expect(page.locator('.header-cta')).toBeVisible();
    for (const item of await page.locator('.desktop-nav .nav-item').all()) {
      await item.locator('.nav-link').hover();
      await expect(item.locator('.nav-panel')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(item.locator('.nav-panel')).not.toBeVisible();
    }
    const toggle=page.locator('[data-nav-toggle]');
    await toggle.click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await expect(page.locator('.desktop-nav')).toHaveAttribute('inert','');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(page.locator('.desktop-nav')).not.toHaveAttribute('inert','');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const boxes=await page.locator('.brand, .desktop-nav, .header-tools').evaluateAll(nodes=>nodes.map(n=>({left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right})));
    expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left);
    expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left);
    await page.screenshot({path:`test-results/header-${width}.png`});
  });
}

for (const route of ['index','private-training']) {
  test(`${route} discovery form directly submits and reports success`, async ({page}) => {
    const sent=[];
    await page.route('**/functions/v1/inquiry', route=> { sent.push(route.request().postDataJSON()); return route.fulfill({status:202,json:{accepted:true,mailed:true}}); });
    await page.route('https://formsubmit.co/**', route=>route.abort());
    await page.route('**/api/availability?**',route=>route.fulfill({json:{slots:[]}}));
    await page.goto(`/${route}.html`);
    await page.locator('main [data-open-modal="discovery"]').first().click();
    const form=page.locator('dialog[open] form');
    for(const name of ['name','company','phone','city_state','desired_timing']) await form.locator(`[name="${name}"]`).fill('Review test');
    await form.locator('[name="email"]').fill('qa@example.com');
    await form.locator('[name="employee_count"]').fill('3');
    await form.locator('[name="industry"]').selectOption({index:1});
    await form.locator('[name="training_interest"]').selectOption({index:1});
    await form.locator('[name="consent"]').check();
    await form.locator('[type="submit"]').click();
    await expect(form.locator('[data-form-notice]')).toContainText('Your inquiry was sent');
    expect(sent).toHaveLength(1);
    expect(sent[0].email).toBe('qa@example.com');
    await expect(form.getByRole('link',{name:'Open Email Draft'})).toHaveCount(0);
  });
}

for(const name of ['iPhone 13','Pixel 7','iPad (gen 7)']) {
  test(`${name} emulation retains navigation, dialog and layout`, async({browser})=>{
    const {defaultBrowserType,...device}=devices[name];
    const context=await browser.newContext({...device});
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:4175/');
    await page.locator('[data-nav-toggle]').click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await page.locator('[data-nav-panel] [data-open-modal]').first().click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.locator('dialog[open] [data-close-modal]').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(report.violations.map(v=>v.id)).toEqual([]);
    await context.close();
  });
}

test('return page uses saved booking reference and never treats Stripe success as confirmation',async({page})=>{
  const reference='0123456789abcdef0123456789abcdef';
  let url;
  await page.route('**/api/status?**',route=>{url=route.request().url();return route.fulfill({json:{status:'expired'}});});
  await page.goto('/');
  await page.evaluate(ref=>sessionStorage.setItem('prestige-booking-ref',ref),reference);
  await page.goto('/booking-confirmation.html?success=true&session_id=cs_test_12345678901234567890');
  await expect(page.locator('[data-confirmation]')).toContainText('If you have already paid');
  expect(new URL(url).searchParams.get('ref')).toBe(reference);
  expect(new URL(url).searchParams.has('session_id')).toBe(false);
});
