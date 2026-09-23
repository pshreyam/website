import { test, expect } from "@playwright/test";

// The theme resolves in three layers: a saved choice wins, otherwise the OS
// preference decides, and light is the ultimate fallback. Each layer is tested
// separately because a regression in one is invisible from the others.

const bg = (page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const DARK_BG = "rgb(8, 9, 10)";
const LIGHT_BG = "rgb(252, 252, 253)";

test.describe("follows the OS when no choice is saved", () => {
  test("dark OS preference renders dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
    expect(await bg(page)).toBe(DARK_BG);
  });

  test("light OS preference renders light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    expect(await bg(page)).toBe(LIGHT_BG);
  });
});

test.describe("explicit choice", () => {
  test("toggling switches the theme and persists it", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(await bg(page)).toBe(DARK_BG);

    await page.getByRole("button", { name: "Switch color theme" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bg(page)).toBe(LIGHT_BG);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");

    // and back again
    await page.getByRole("button", { name: "Switch color theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
  });

  test("a saved choice overrides the OS preference on the next page", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));

    await page.goto("/projects/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bg(page)).toBe(LIGHT_BG);
  });

  // Guards the blocking <head> script. If it were deferred, a saved light theme
  // would paint dark first and flash — the whole reason that script is inline.
  test("saved choice is applied before first paint", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));

    await page.goto("/", { waitUntil: "commit" });
    const themeAtCommit = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(themeAtCommit).toBe("light");
  });
});

test.describe("toggle icon", () => {
  // The icon shows the theme it will switch TO, not the current one.
  test("shows a moon in light mode and a sun in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator(".theme-toggle .icon-moon")).toBeVisible();
    await expect(page.locator(".theme-toggle .icon-sun")).toBeHidden();

    await page.getByRole("button", { name: "Switch color theme" }).click();

    await expect(page.locator(".theme-toggle .icon-sun")).toBeVisible();
    await expect(page.locator(".theme-toggle .icon-moon")).toBeHidden();
  });
});
