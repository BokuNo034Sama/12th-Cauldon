import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import base from "./base.mjs";

export default [
  ...base,
  ...tseslint.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
];
