import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./netlify/db/schema",
    out: "./drizzle"
});