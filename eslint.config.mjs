import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "never"],
      indent: ["error", 2, { SwitchCase: 1 }],
      "no-multi-spaces": ["error"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": ["error"],
      "space-before-blocks": ["error", "always"],
      "space-in-parens": ["error", "never"],
      "space-before-function-paren": [
        "error",
        { anonymous: "never", named: "never", asyncArrow: "always" },
      ],
      "comma-spacing": ["error", { before: false, after: true }],
      "array-bracket-spacing": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
    },
  },
]

export default eslintConfig
