import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://AI-MOCKER_owner:npg_uz9PsrolS7XQ@ep-ancient-unit-a568ci79-pooler.us-east-2.aws.neon.tech/AI-MOCKER?sslmode=require",
  },
});
