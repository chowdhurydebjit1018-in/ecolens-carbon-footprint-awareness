import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      FIREBASE_PROJECT_ID: "mock-project-id",
    },
    setupFiles: ["./server/tests/setup.ts"],
  },
});
