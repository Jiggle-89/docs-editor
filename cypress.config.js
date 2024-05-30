import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      // or a function - the result is merged with
      // any `vite.config` file that is detected
      viteConfig: async () => {
        // ... do things ...
        const modifiedConfig = await injectCustomConfig(baseConfig);
        return modifiedConfig;
      },
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:5173",
  },
});
