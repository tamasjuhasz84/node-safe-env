import { createEnv, defineEnv, maskEnv, type EnvDebugReport } from "../../src";

const schema = defineEnv({
  ADMIN_EMAIL: { type: "email", required: true },
  START_DATE: {
    type: "date",
    default: () => "2026-01-01",
  },
  ALLOWED_HOSTS: {
    type: "array",
    separator: "|",
    trimItems: false,
    allowEmptyItems: true,
    default: () => ["api.example.com", "cdn.example.com"],
  },
  API_TOKEN: {
    type: "string",
    required: true,
    sensitive: true,
  },
} as const);

const debugReports: EnvDebugReport[] = [];

const env = createEnv(schema, {
  source: {
    ADMIN_EMAIL: "admin@example.com",
    ALLOWED_HOSTS: "api.example.com| cdn.example.com||edge.example.com",
    API_TOKEN: "super-secret-token",
  },
  debug: {
    logger: (report) => {
      debugReports.push(report);
    },
  },
});

const safeForLogs = maskEnv(schema, env);

console.log(env.START_DATE.toISOString());
console.log(env.ALLOWED_HOSTS);
console.log(safeForLogs);
console.log(debugReports[0]);
