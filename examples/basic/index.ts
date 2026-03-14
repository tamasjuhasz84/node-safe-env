import { createEnv } from "../../src";

const env = createEnv(
  {
    APP_NAME: { type: "string", required: true },
    PORT: { type: "port", default: 3000 },
    DEBUG: { type: "boolean", default: false },
    NODE_ENV: {
      type: "enum",
      values: ["development", "test", "production"] as const,
      default: "development",
    },
  },
  {
    source: {
      APP_NAME: "node-safe-env-demo",
      PORT: "8080",
      DEBUG: "true",
      NODE_ENV: "production",
    },
  },
);

console.log({
  appName: env.APP_NAME,
  port: env.PORT,
  debug: env.DEBUG,
  nodeEnv: env.NODE_ENV,
});
