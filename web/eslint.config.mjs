export default {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "next/core-web-vitals",
  ],
  plugins: ["react", "react-hooks", "jsx-a11y"],
  rules: {
    // Core quality & style
    "no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "no-undef": "error",
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    "block-scoped-var": "error",
    "no-shadow": "error",
    "prefer-arrow-callback": [
      "error",
      { allowNamedFunctions: false, allowUnboundThis: true },
    ],
    "arrow-body-style": ["error", "as-needed"],

    // Console / debugging
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],

    // React specific
    "react/react-in-jsx-scope": "off", // Next.js with new JSX transform
    "react/prop-types": "warn",
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-no-target-blank": [
      "error",
      { allowReferrer: false, enforceDynamicLinks: "always" },
    ],

    // Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Accessibility
    "jsx-a11y/anchor-is-valid": "off", // handled by next/link; keep off to avoid false positives
    "jsx-a11y/no-noninteractive-element-interactions": "warn",

    // Next.js plugin rules (strict posture)
    "next/no-html-link-for-pages": ["error", "app"],

    // Import / module hygiene
    "import/no-unresolved": "off", // enable if you use eslint-plugin-import + proper resolver
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/prop-types": "off", // TypeScript covers types
      },
    },
    {
      files: ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**"],
      env: { jest: true },
      rules: {
        "no-console": "off",
      },
    },
  ],
};
