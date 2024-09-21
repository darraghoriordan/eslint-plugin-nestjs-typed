import globals from "globals";
import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import {FlatCompat} from "@eslint/eslintrc";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    ...compat.plugins("eslint-plugin-prefer-arrow"),
    eslintPluginUnicorn.configs["flat/recommended"],
    prettierConfig,

    {
        ignores: [
            "**/commitlint.config.*js",
            "**/eslint.config.*js",
            "**/jest.config.*js",
            "**/jest.config.*ts",
        ],
    },
    {
        languageOptions: {
            ecmaVersion: 2021,
            globals: {
                ...globals.es2021,
                ...globals.node,
                ...globals.jest,
            },
            parserOptions: {
                project: ["tsconfig.lint.json"],
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
    }
);
