module.exports = {
    env: {
        es2017: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:unicorn/recommended",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
    },
    settings: {
        "import/extensions": [".ts"],
    },
    rules: {
        "import/default": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
        "import/namespace": "off", // this is very slow
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
        "@typescript-eslint/restrict-template-expressions": "off",
        "unicorn/no-fn-reference-in-iterator": "off",
        "unicorn/no-array-for-each": "off",
        "unicorn/no-null": "off",
        "unicorn/prefer-array-some": "off",
        "unicorn/consistent-destructuring": "off",
        "unicorn/no-array-reduce": "off",
        "unicorn/prefer-spread": "off",
        "unicorn/no-array-callback-reference": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/camelcase": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-useless-undefined": "off",
        "unicorn/prefer-ternary": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
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
    plugins: ["@typescript-eslint", "import", "prefer-arrow", "unicorn"],
};
