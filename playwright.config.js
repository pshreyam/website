import { defineConfig, devices } from "@playwright/test";

// Port 1314, not 1313, so a dev server you already have open keeps working.
const PORT = 1314;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    // --minify so the tests exercise the markup that actually ships;
    // --disableLiveReload so Hugo's injected websocket script isn't in the DOM.
    command: `hugo server --port ${PORT} --minify --disableLiveReload --disableFastRender`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
