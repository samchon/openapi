import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: [
        "./src/**",
      ],
    }
  },
  lib: [
    {
      format: "cjs",
      bundle: false,
      dts: {
        autoExtension: true,
      },
      output: {
        filename: {
          js: "[name].js",
        },
        distPath: {
          root: "./lib",
        },
        sourceMap: true,
      },
    },
    {
      format: "esm",
      bundle: false,
      dts: {
        autoExtension: true,
      },
      output: {
        filename: {
          js: "[name].mjs",
        },
        distPath: {
          root: "./lib",
        },
        sourceMap: true,
      },
    },
  ],
});
