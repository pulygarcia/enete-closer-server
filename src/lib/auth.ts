import * as dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: new Pool({
    connectionString,
    ssl:
      process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "VIEWER",
      }
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});