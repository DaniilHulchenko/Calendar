module.exports = {
  extends: [
    "next/core-web-vitals",
    "prettier",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  plugins: ["prettier", "@tanstack/query"],
  rules: {
    "prettier/prettier": 2, // Means error
  },
};
