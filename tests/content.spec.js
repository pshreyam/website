import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/projects/",
  "/projects/foodie/",
  "/blogs/",
  "/blogs/aliases-for-navigation/",
  "/tags/",
  "/tags/python/",
  "/contact/",
];

for (const path of PAGES) {
  test(`${path} has exactly one h1 and a non-empty title`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  });
}

test("every image has alt text", async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const missing = await page
      .locator("img")
      .evaluateAll((els) =>
        els.filter((e) => !e.getAttribute("alt")).map((e) => e.src),
      );
    expect(missing, `images without alt on ${path}`).toEqual([]);
  }
});

test("the portrait is served at 2x for the slot it occupies", async ({ page }) => {
  await page.goto("/");
  const img = page.locator(".hero-photo");
  await expect(img).toBeVisible();

  const { cssWidth, naturalWidth } = await img.evaluate((el) => ({
    cssWidth: el.getBoundingClientRect().width,
    naturalWidth: el.naturalWidth,
  }));
  // naturalWidth is density-corrected for x-descriptor srcset, so it should
  // match the CSS box exactly when the right candidate was chosen.
  expect(cssWidth).toBe(140);
  expect(naturalWidth).toBe(140);
});

test("project rows link through to their pages", async ({ page }) => {
  await page.goto("/projects/");
  const rows = page.locator(".card");
  await expect(rows).toHaveCount(4);

  const first = rows.first();
  await expect(first.locator(".card-arrow")).toHaveCount(1);
  await first.locator("h3 a").click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+\/$/);
  await expect(page.locator("h1")).toBeVisible();
});

test("blog post renders prose and code blocks", async ({ page }) => {
  await page.goto("/blogs/aliases-for-navigation/");
  await expect(page.locator(".prose")).toBeVisible();

  const blocks = page.locator(".prose .highlight");
  expect(await blocks.count()).toBeGreaterThan(0);

  // Long shell lines must scroll inside the block, never widen the page.
  await expect(blocks.first().locator("pre")).toHaveCSS("overflow-x", "auto");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});

test("404 page renders through the site layout", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist/");
  expect(res.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Page not found");
  await expect(page.locator(".site-header")).toBeVisible();
});

test("no page overflows horizontally on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const path of PAGES) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows, `${path} overflows at 390px`).toBe(false);
  }
});

test("no console errors on any page", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  for (const path of PAGES) {
    await page.goto(path);
  }
  expect(errors).toEqual([]);
});
