import type {FlatConfig, Linter} from "@typescript-eslint/utils/ts-eslint";
import noSwagger from "./configs/noSwagger";
import recommended from "./configs/recommended";
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
        recommended: recommended,
        "no-swagger": noSwagger,
    },
    rules,
    meta,
} satisfies Linter.Plugin;

const flatBaseConfig = (
    plugin: FlatConfig.Plugin,
    parser: FlatConfig.Parser
): FlatConfig.Config => {
    const baseConfig: FlatConfig.Config = {
        name: "@darraghor/nestjs-typed/base",
        languageOptions: {
            parser,
            sourceType: "module",
        },
        plugins: {
            "@darraghor/nestjs-typed": plugin,
        },
    };
    return baseConfig;
};

// export the classic plugin configs
export {classicPlugin};
export type ConfigArray = TSESLint.FlatConfig.ConfigArray;
// export the flat configs
export default {
    plugin,
    configs: {
        flatRecommended: [
            flatBaseConfig(plugin, parser),
            {
                name: "@darraghor/nestjs-typed/recommended",
                rules: recommended.rules,
            },
        ],
        flatNoSwagger: [
            {
                name: "@darraghor/nestjs-typed/no-swagger",
                rules: noSwagger.rules,
            },
        ],
    } as {
        flatRecommended: ConfigArray;
        flatNoSwagger: ConfigArray;
    },
};
