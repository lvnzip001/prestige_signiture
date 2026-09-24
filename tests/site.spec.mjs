import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["index", "training-programs", "prestige-standard", "professional-credential", "who-we-serve", "about", "contact", "open-enrollment", "404"];
const widths = [360, 390, 768, 1024, 1280, 1440, 1920];

for (const width of widths) {
  for (const route of routes) {
    test(`${route} at ${width}px`, async ({ page }, testInfo) => {
      const failures = [];
      page.on("pageerror", error => failures.push(error.message));
      page.on("requestfailed", request => failures.push(`${request.failure().errorText} ${request.url()}`));
      page.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${route}.html`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".nav-toggle")).toBeVisible({ visible: width < 1440 });
      const overflow = await page.evaluate(() => [...document.querySelectorAll("main *, header *, footer *")].filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width && getComputedStyle(node).position !== "absolute" && rect.right > document.documentElement.clientWidth + 1 && !node.closest(".sector-nav, .mobile-nav, .program-rail");
      }).map(node => `${node.tagName}.${node.className}`));
      expect(overflow).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      // Exercise lazy images and reveals before taking a complete-page screenshot.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise(resolve => setTimeout(resolve, 45));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await expect.poll(() => page.locator("main img").evaluateAll(images => images.filter(image => image.getClientRects().length).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      await page.waitForTimeout(700);
      await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`), fullPage: true });
      expect(failures).toEqual([]);
      if (width === 390 || width === 1440) {
        const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
      }
    });
  }
}

test("navigation traps focus, closes with Escape, and releases on resize", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("[data-nav-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  const last = page.locator("[data-nav-panel] a").last();
  await last.focus();
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("body")).not.toHaveClass(/nav-open/);
});

test("POISE tabs support keyboard and deep links; curriculum uses native details", async ({ page }) => {
  await page.goto("/prestige-standard.html#standard-poise-2");
  await expect(page.locator("#standard-poise-2")).toBeVisible();
  const first = page.getByRole("tab").first();
  await first.click();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-poise-panel]:visible")).toHaveCount(1);
  await page.goto("/training-programs.html#full-academy");
  await expect(page.locator("#full-academy details")).toHaveAttribute("open", "");
  await expect(page.locator(".accordion")).toHaveCount(15);
  await page.locator(".accordion summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".accordion").first()).toHaveAttribute("open", "");
});

test("program and sector inquiries prefill dialogs with working focus restoration", async ({ page }) => {
  await page.goto("/training-programs.html#two-day");
  const trigger = page.locator("#two-day [data-open-modal]");
  await trigger.click();
  const dialog = page.locator('[data-modal="discovery"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[name="training_interest"]')).toHaveValue("Two-Day");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/dialog-open/);
  await page.goto("/who-we-serve.html#hotels");
  await page.locator("#hotels [data-open-modal]").click();
  await expect(dialog.locator('[name="industry"]')).toHaveValue("Hotel-Resort");
  const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations.map(v => v.id)).toEqual([]);
  await dialog.locator("[data-close-modal]").click();
  await expect(dialog).not.toBeVisible();
});

test("both forms validate, preserve details, and never transmit", async ({ page }) => {
  const posts = [];
  page.on("request", request => { if (request.method() !== "GET") posts.push(request.url()); });
  for (const [route, id] of [["contact", "discovery-form"], ["open-enrollment", "interest-form"]]) {
    await page.goto(`/${route}.html?training_interest=Full+Academy&industry=Restaurant#${id}`);
    const form = page.locator(`#${id} form`);
    await expect(form).toBeVisible();
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await form.locator('[type="submit"]').click();
    await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
    await form.locator('input[required]:not([type="checkbox"])').evaluateAll(inputs => inputs.forEach(input => {
      input.value = input.type === "email" ? "test@example.com" : input.type === "number" ? "12" : input.type === "tel" ? "5551234567" : "Test inquiry";
    }));
    await form.locator("select[required]").evaluateAll(selects => selects.forEach(select => { select.selectedIndex = 1; }));
    await form.locator('[type="checkbox"]').check();
    await form.locator('[type="submit"]').click();
    await expect(form.locator("[data-form-notice]")).toBeVisible();
    await expect(form.locator("[data-form-notice]")).toContainText("did not send");
    await expect(form.locator('[name="name"]')).toHaveValue("Test inquiry");
  }
  expect(posts).toEqual([]);
});

test("unknown prefill values are ignored", async ({ page }) => {
  await page.goto("/contact.html?training_interest=made-up&industry=made-up#discovery-form");
  await expect(page.locator('#discovery-form [name="training_interest"]')).toHaveValue("");
  await expect(page.locator('#discovery-form [name="industry"]')).toHaveValue("");
});

test("without JavaScript, navigation, content, links and non-submitting forms remain usable", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4175/prestige-standard.html");
  await expect(page.locator("[data-poise-panel]:visible")).toHaveCount(5);
  await expect(page.locator("[data-nav-panel]")).toBeVisible();
  await page.locator("[data-nav-panel] [data-open-modal]").click();
  await expect(page).toHaveURL(/contact.html#discovery-form/);
  await expect(page.locator('#discovery-form [type="submit"]')).toBeDisabled();
  const url = page.url();
  await page.locator('#discovery-form [name="name"]').fill("No submission");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(url);
  await context.close();
});

test("reduced motion keeps content visible and disables movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator(".reveal").first().evaluate(node => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform }))).toEqual({ opacity: "1", transform: "none" });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});

test("mobile program rail supports explicit next and previous controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const track = page.locator("[data-rail-track]");
  const previous = page.locator("[data-rail-prev]");
  await expect(previous).toBeDisabled();
  await page.locator("[data-rail-next]").click();
  await expect.poll(() => track.evaluate(node => node.scrollLeft)).toBeGreaterThan(100);
  await previous.click();
  await expect.poll(() => track.evaluate(node => node.scrollLeft)).toBeLessThan(3);
});
