import { defineEnv } from "../../src";

const schema = defineEnv({
  SERVER_PORT: { type: "port", default: 3000 },
  ADMIN_EMAIL: { type: "email", required: true },
  API_TOKEN: { type: "string", required: true, sensitive: true },
} as const);

export default schema;

// Example usage:
// node-safe-env validate --schema ./examples/cli-schema/env.schema.ts
// node-safe-env validate-example --schema ./examples/cli-schema/env.schema.ts
