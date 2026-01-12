import { column, defineDb, NOW } from "astro:db";

// https://astro.build/db/config
export default defineDb({
  tables: {
    Requests: {
      columns: {
        url: column.text({ primaryKey: true }),
        responseHeaders: column.json(),
        responseBody: column.text(),
        timestamp: column.number({ default: NOW }),
      },
    },
  },
});
