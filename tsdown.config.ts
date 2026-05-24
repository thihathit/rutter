import { defineConfig } from "tsdown";

export default defineConfig({
  tsconfig: "tsconfig.lib.json",
  entry: ["./core/index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  treeshake: true,
  dts: true,
  clean: true,
  sourcemap: true,
});
