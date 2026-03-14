import { createEnv } from "../../src";

const env = createEnv({
  PORT: { type: "number", default: 3000 },
  NODE_ENV: {
    type: "enum",
    values: ["development", "test", "production"] as const,
    default: "development",
  },
  DEBUG: { type: "boolean", default: false },
});

console.log(env);
