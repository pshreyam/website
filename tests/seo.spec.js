import { test, expect } from "@playwright/test";

const meta = (page, sel) => page.locator(sel).getAttribute("content");

test("home page carries the full meta set", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toContain("Software Engineer");
  expect(await meta(page, 'meta[name="description"]')).toBeTruthy();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

  for (const prop of ["og:title", "og:description", "og:url", "og:type", "og:image"]) {
    expect(await meta(page, `meta[property="${prop}"]`), prop).toBeTruthy();
  }
  expect(await meta(page, 'meta[name="twitter:image"]')).toBeTruthy();
});

test("meta description stays within the length search engines show", async ({ page }) => {
  for (const path of ["/", "/projects/", "/blogs/", "/contact/"]) {
    await page.goto(path);
    const d = await meta(page, 'meta[name="description"]');
    expect(d.length, `${path} description length`).toBeLessThanOrEqual(160);
    // A trailing ellipsis means it was truncated mid-sentence rather than written.
    expect(d.endsWith("…"), `${path} description is truncated`).toBe(false);
  }
});

test("Person schema on home is valid JSON", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw);
  expect(data["@type"]).toBe("Person");
  expect(data.name).toBeTruthy();
  expect(Array.isArray(data.sameAs)).toBe(true);
});

test("BlogPosting schema on a post is valid JSON", async ({ page }) => {
  await page.goto("/blogs/aliases-for-navigation/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw);
  expect(data["@type"]).toBe("BlogPosting");
  expect(data.headline).toBeTruthy();
  expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test.describe("thin taxonomy pages stay out of the index", () => {
  test("tag pages are noindex", async ({ page }) => {
    for (const path of ["/tags/", "/tags/python/"]) {
      await page.goto(path);
      expect(await meta(page, 'meta[name="robots"]'), path).toBe("noindex,follow");
    }
  });

  test("real pages are not noindex", async ({ page }) => {
    for (const path of ["/", "/projects/", "/blogs/aliases-for-navigation/"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveCount(0);
    }
  });
});

test("sitemap lists real pages and excludes tag pages", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(0);
  expect(locs.filter((l) => l.includes("/tags/"))).toEqual([]);
  expect(locs.some((l) => l.endsWith("/projects/foodie/"))).toBe(true);
});

test("robots.txt points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Sitemap:");
});

test("RSS feed is served and discoverable", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveCount(1);

  const res = await request.get("/index.xml");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("<rss");
});

test("external links are hardened against tab-nabbing", async ({ page }) => {
  await page.goto("/");
  const unsafe = await page
    .locator('a[target="_blank"]')
    .evaluateAll((els) =>
      els
        .filter((e) => !(e.getAttribute("rel") || "").includes("noopener"))
        .map((e) => e.href),
    );
  expect(unsafe).toEqual([]);
});
