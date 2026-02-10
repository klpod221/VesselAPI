import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  external: ["react"],
  loader: {
    ".png": "dataurl",
  },
  dts: true,
  clean: true,
  sourcemap: true,
});
