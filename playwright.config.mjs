import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: true,
  workers: 2,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "test-results",
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:4175",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx --yes serve . -l tcp://127.0.0.1:4175 --no-clipboard",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
