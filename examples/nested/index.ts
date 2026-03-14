import { createEnv } from "../../src";

const env = createEnv(
  {
    server: {
      port: { type: "port", default: 3000 },
      host: { type: "string", default: "127.0.0.1" },
    },
    database: {
      url: { type: "string", required: true },
    },
  },
  {
    // Nested schema keys are flattened to SERVER_PORT, SERVER_HOST, DATABASE_URL.
    source: {
      SERVER_PORT: "4000",
      DATABASE_URL: "postgres://localhost:5432/app",
    },
  },
);

console.log(env.server.port); // 4000
console.log(env.server.host); // "127.0.0.1"
console.log(env.database.url); // "postgres://localhost:5432/app"
