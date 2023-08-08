module.exports = {
    env: {
        es2021: true,
        node: true,
        jest: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:unicorn/recommended",
        "prettier",
    ],
    ignorePatterns: ["**/jest.config.ts"],

    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.lint.json"],
        sourceType: "module",
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
                allowList: {Param: true, Req: true, Res: true},
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
    plugins: ["@typescript-eslint", "prefer-arrow", "unicorn"],
};
