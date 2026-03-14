import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "node18",
    minify: false,
  },
  {
    entry: {
      cli: "src/cli/index.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: true,
    clean: false,
    target: "node18",
    minify: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
