const schema = {
  server: {
    port: { type: "port", required: true },
  },
  database: {
    url: { type: "string", required: true },
  },
} as const;

export default schema;
