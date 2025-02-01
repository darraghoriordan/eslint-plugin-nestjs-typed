import type {FlatConfig, Linter} from "@typescript-eslint/utils/ts-eslint";
import configs from "./configs";
import rules from "./rules";
import {TSESLint} from "@typescript-eslint/utils";
import * as parserBase from "@typescript-eslint/parser";
import pluginBase from "@typescript-eslint/eslint-plugin";

// Most of this is copied and simplified from https://github.com/typescript-eslint/typescript-eslint/blob/v8.22.0/packages/typescript-eslint/src/configs/recommended.ts

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {name, version} = require("../package.json") as {
    name: string;
    version: string;
};
const meta = {
    name,
    version,
};
export const parser: TSESLint.FlatConfig.Parser = {
    meta: parserBase.meta,
    parseForESLint: parserBase.parseForESLint,
};

export const plugin: TSESLint.FlatConfig.Plugin = pluginBase as Omit<
    typeof pluginBase,
    "configs"
>;
const classicPlugin = {
    configs: {
        recommended: configs.recommended,
        "no-swagger": configs["no-swagger"],
    },
    rules,
    meta,
} satisfies Linter.Plugin;

export function flatBaseConfig(
    plugin: FlatConfig.Plugin,
    parser: FlatConfig.Parser
): FlatConfig.Config {
    return {
        name: "@darraghor/nestjs-typed/base",
        languageOptions: {
            parser,
            sourceType: "module",
        },
        plugins: {
            "@darraghor/nestjs-typed": plugin,
        },
    };
}

export function flatRecommendedConfig(
    plugin: FlatConfig.Plugin,
    parser: FlatConfig.Parser
): FlatConfig.ConfigArray {
    return [
        flatBaseConfig(plugin, parser),
        {
            name: "@darraghor/nestjs-typed/recommended",
            rules: configs.recommended.rules,
        },
    ];
}
export function flatNoSwaggerConfig(): FlatConfig.ConfigArray {
    return [
        {
            name: "@darraghor/nestjs-typed/recommended",
            rules: configs.recommended.rules,
        },
    ];
}
const flatRecommended = flatRecommendedConfig(plugin, parser);
const flatNoSwagger = flatNoSwaggerConfig();
// export the flat configs
export {flatRecommended, flatNoSwagger};

// export the classic plugin so people can use it in their eslint configs
export default classicPlugin;
