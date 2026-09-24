import { test, expect } from "@playwright/test";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

test("generated pages have valid local links, assets, unique IDs and metadata", async ({ page }) => {
  const routes = ["index", "training-programs", "prestige-standard", "professional-credential", "who-we-serve", "about", "contact", "open-enrollment", "404"];
  const documents = {};
  for (const route of routes) documents[`${route}.html`] = await readFile(`${route}.html`, "utf8");
  const report = await page.evaluate(documents => {
    const parser = new DOMParser();
    const docs = Object.fromEntries(Object.entries(documents).map(([route, html]) => [route, parser.parseFromString(html, "text/html")]));
    const errors = [];
    const assets = new Set();
    const titles = [];
    const descriptions = [];
    for (const [route, doc] of Object.entries(docs)) {
      const ids = [...doc.querySelectorAll("[id]")].map(node => node.id);
      if (ids.length !== new Set(ids).size) errors.push(`${route}: duplicate IDs`);
      titles.push(doc.title);
      descriptions.push(doc.querySelector('meta[name="description"]')?.content);
      for (const link of doc.querySelectorAll("a[href]")) {
        const href = link.getAttribute("href");
        if (/^(https?:|mailto:|tel:)/.test(href)) continue;
        const url = new URL(href, `https://example.test/${route}`);
        const target = docs[pathname(url)];
        if (!target) errors.push(`${route}: missing page ${href}`);
        else if (url.hash && !target.getElementById(url.hash.slice(1))) errors.push(`${route}: missing anchor ${href}`);
      }
      for (const image of doc.querySelectorAll("img")) {
        if (!image.hasAttribute("alt") || !image.width || !image.height) errors.push(`${route}: incomplete image metadata`);
        assets.add(image.getAttribute("src"));
        for (const candidate of (image.getAttribute("srcset") || "").split(",")) {
          if (candidate.trim()) assets.add(candidate.trim().split(/\s+/)[0]);
        }
      }
      for (const node of doc.querySelectorAll('script[src], link[rel="stylesheet"], link[rel="icon"], link[rel="preload"]')) assets.add(node.getAttribute("src") || node.getAttribute("href"));
      for (const label of doc.querySelectorAll("label[for]")) if (!doc.getElementById(label.htmlFor)) errors.push(`${route}: orphan label ${label.htmlFor}`);
      for (const node of doc.querySelectorAll("[aria-describedby], [aria-labelledby]")) {
        for (const id of `${node.getAttribute("aria-describedby") || ""} ${node.getAttribute("aria-labelledby") || ""}`.trim().split(/\s+/)) if (!doc.getElementById(id)) errors.push(`${route}: orphan ARIA reference ${id}`);
      }
    }
    function pathname(url) { return url.pathname.slice(1) || "index.html"; }
    return { errors, assets: [...assets], titles, descriptions };
  }, documents);
  expect(report.errors).toEqual([]);
  expect(new Set(report.titles).size).toBe(routes.length);
  expect(new Set(report.descriptions).size).toBe(routes.length);
  for (const asset of report.assets) await access(path.resolve(asset));
  const sitemap = await readFile("sitemap.xml", "utf8");
  for (const route of routes.filter(route => !["index", "404"].includes(route))) expect(sitemap).toContain(`/${route}.html`);
  for (const price of ["3,750", "6,000", "10,000", "35,000"]) expect(documents["training-programs.html"]).toContain(`$${price}`);
  for (const price of ["300", "500", "900", "3,200"]) expect(documents["open-enrollment.html"]).toContain(`$${price}`);
  for (const price of ["650", "800", "950"]) expect(documents["professional-credential.html"]).toContain(`$${price}`);
  for (const html of Object.values(documents)) expect(html).not.toMatch(/Natasha Wimbley|lorem ipsum|INSERT WHEN ESTABLISHED|Founder &amp; Lead Trainer/i);
});
