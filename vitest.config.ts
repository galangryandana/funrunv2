import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

const tmpDir = resolve(__dirname, ".vitest-tmp");
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}
process.env.TMPDIR = tmpDir;

export default defineConfig({
  cacheDir: "./node_modules/.vitest",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: [],
  },
});
