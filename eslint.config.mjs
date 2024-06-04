export default [
  {
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    files: ["src/**/*.ts"],
    rules: {
      semi: "error",
      quotes: ["error", "double"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  }
]
