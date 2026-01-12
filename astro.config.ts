import { defineConfig, envField } from "astro/config";

import node from "@astrojs/node";

import db from "@astrojs/db";

export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  env: {
    schema: {
      ASTRO_DATABASE_FILE: envField.string({
        access: "public",
        context: "server",
      }),
      ASTRO_DB_REMOTE_URL: envField.string({
        access: "public",
        context: "server",
      }),
      DOCKER_SOCKET_BASE_URL: envField.string({
        access: "public",
        context: "server",
      }),
    },
  },

  integrations: [db()],
});
