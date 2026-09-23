import { test, expect } from "@playwright/test";

test.describe("desktop nav", () => {
  test("marks the current section", async ({ page }) => {
    await page.goto("/projects/");
    const nav = page.locator("#primary-nav");
    await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // exactly one item is current
    await expect(nav.locator("a[aria-current]")).toHaveCount(1);
  });

  test("every nav link reaches a real page", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator("#primary-nav a").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(hrefs.length).toBe(5);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `${href} should resolve`).toBe(200);
    }
  });
});

test.describe("mobile nav", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("opens, closes on link click, and reports state", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle navigation" });
    const nav = page.locator("#primary-nav");

    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(nav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await nav.getByRole("link", { name: "Blogs" }).click();
    await expect(page).toHaveURL(/\/blogs\/$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle navigation" });

    await toggle.click();
    await expect(page.locator("#primary-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#primary-nav")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("keyboard access", () => {
  test("skip link is reachable and targets main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.locator(".skip-link");
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main");
    // It must actually slide into view once focused, not merely exist offscreen.
    // Retrying matcher, because it animates in over 150ms.
    await expect(skip).toBeInViewport();
    await expect(page.locator("#main")).toHaveCount(1);
  });
});

test("no internal link anywhere on the site is broken", async ({ page, request }) => {
  const pages = ["/", "/projects/", "/blogs/", "/tags/", "/contact/"];
  const seen = new Set();

  for (const path of pages) {
    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((els) =>
        els
          .map((e) => e.getAttribute("href"))
          .filter((h) => h && h.startsWith("/") && !h.startsWith("//")),
      );
    hrefs.forEach((h) => seen.add(h));
  }

  expect(seen.size).toBeGreaterThan(10);
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), `${href} should resolve`).toBe(200);
  }
});
