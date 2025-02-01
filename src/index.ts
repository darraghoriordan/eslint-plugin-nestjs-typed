import {Linter} from "eslint";
import configs from "./configs";

interface NestPluginRules {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rules: Record<string, any>;
}

export const flatRecommendedConfig = [
    {
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        plugins: {
            "@darraghor/nestjs-typed": {
                rules: Object.fromEntries(
                    Object.entries(configs.recommended.rules).map(
                        ([key, value]) => [
                            key.replace("@darraghor/nestjs-typed/", ""),
                            value,
                        ]
                    )
                ),
            },
        },
        rules: configs.recommended.rules,
    },
];
export const flatNoSwaggerConfig = [
    {
        plugins: {
            "@darraghor/nestjs-typed": {
                rules: Object.fromEntries(
                    Object.entries(configs["no-swagger"].rules).map(
                        ([key, value]) => [
                            key.replace("@darraghor/nestjs-typed/", ""),
                            value,
                        ]
                    )
                ),
            },
        },
        rules: configs["no-swagger"].rules,
    },
];

// Traditional .eslintrc format
export const eslintrcRecommended: Linter.Config = {
    plugins: {
        "@darraghor/nestjs-typed": {
            rules: Object.fromEntries(
                Object.entries(configs.recommended.rules).map(
                    ([key, value]) => [
                        key.replace("@darraghor/nestjs-typed/", ""),
                        value,
                    ]
                )
            ),
        } as NestPluginRules,
    },
    rules: configs.recommended.rules,
};
export const eslintrcNoSwagger: Linter.Config = {
    plugins: {
        "@darraghor/nestjs-typed": {
            rules: Object.fromEntries(
                Object.entries(configs["no-swagger"].rules).map(
                    ([key, value]) => [
                        key.replace("@darraghor/nestjs-typed/", ""),
                        value,
                    ]
                )
            ),
        } as NestPluginRules,
    },
    rules: configs["no-swagger"].rules,
};

export default {
    configs: {
        recommended: eslintrcRecommended,
        "flat/recommended": flatRecommendedConfig,
        "no-swagger": eslintrcNoSwagger,
        "flat/no-swagger": flatNoSwaggerConfig,
    },
};
