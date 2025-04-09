import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://MOCKER_owner:npg_Y3Hc5UxgTSWi@ep-wild-moon-a5jdeo4a-pooler.us-east-2.aws.neon.tech/MOCKER?sslmode=require",
  },
});
