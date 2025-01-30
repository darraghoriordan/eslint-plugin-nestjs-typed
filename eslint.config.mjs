import typescriptEslint from "@typescript-eslint/eslint-plugin";
import preferArrow from "eslint-plugin-prefer-arrow";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            "**/jest.config.ts",
            "**/node_modules",
            "**/commitlint.config.js",
            "**/jest.config.js",
            "**/.eslintrc.js",
            "**/jest.config.ts",
            "**/eslint.config.mjs",
        ],
    },
    ...compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:unicorn/recommended",
        "prettier"
    ),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "prefer-arrow": preferArrow,
            unicorn,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                tsconfigRootDir: "./",
                project: ["./tsconfig.lint.json"],
            },
        },

        rules: {
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        camelCase: true,
                        pascalCase: true,
                    },
                },
            ],

            "no-eval": "error",
            "unicorn/no-fn-reference-in-iterator": "off",
            "unicorn/no-array-for-each": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-array-some": "off",
            "unicorn/consistent-destructuring": "off",
            "unicorn/no-array-reduce": "off",
            "unicorn/prefer-spread": "off",
            "unicorn/no-array-callback-reference": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/no-useless-undefined": "off",
            "unicorn/prefer-ternary": "off",
            "unicorn/prefer-node-protocol": "off",

            "unicorn/prevent-abbreviations": [
                "error",
                {
                    allowList: {
                        Param: true,
                        Req: true,
                        Res: true,
                    },
                },
            ],

            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "default",
                    format: null,
                },
                {
                    selector: "variable",
                    format: ["PascalCase", "UPPER_CASE"],
                    types: ["boolean"],
                    prefix: ["is", "should", "has", "can", "did", "will"],
                },
                {
                    selector: "variableLike",
                    format: ["camelCase", "UPPER_CASE", "PascalCase"],
                },
                {
                    selector: "parameter",
                    format: ["camelCase"],
                },
                {
                    selector: "memberLike",
                    modifiers: ["private"],
                    format: ["camelCase"],
                    leadingUnderscore: "forbid",
                },
                {
                    selector: "typeLike",
                    format: ["PascalCase"],
                },
                {
                    selector: "property",
                    modifiers: ["readonly"],
                    format: ["PascalCase"],
                },
                {
                    selector: "enumMember",
                    format: ["UPPER_CASE"],
                },
            ],
        },
    },
];
