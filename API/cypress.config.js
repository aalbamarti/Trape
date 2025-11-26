import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // your backend server
    specPattern: "cypress/e2e/**/*.spec.js",
  },
});
