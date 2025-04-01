import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_Z6MjHqy5tEAQ@ep-plain-dew-a500gpdc-pooler.us-east-2.aws.neon.tech/AI-Interview-mocker?sslmode=require',
  }
});
