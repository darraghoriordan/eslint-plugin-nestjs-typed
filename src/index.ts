import type {FlatConfig, Linter} from "@typescript-eslint/utils/ts-eslint";
import noSwagger from "./configs/noSwagger.js";
import recommended from "./configs/recommended.js";
import rules from "./rules/index.js";
import {TSESLint} from "@typescript-eslint/utils";
import * as parserBase from "@typescript-eslint/parser";
import {fileURLToPath} from "url";
import {readFileSync} from "fs";
import {dirname, resolve} from "path";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename);
const {name, version} = JSON.parse(
    readFileSync(resolve(__dirname, "../package.json"), "utf8")
) as {
    name: string;
    version: string;
};
// Most of this is copied and simplified from https://github.com/typescript-eslint/typescript-eslint/blob/v8.22.0/packages/typescript-eslint/src/configs/recommended.ts

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder

const meta = {
    name,
    version,
};
export const parser: TSESLint.FlatConfig.Parser = {
    meta: parserBase.meta,
    parseForESLint: parserBase.parseForESLint,
};

const classicPlugin: Linter.Plugin = {
    configs: {
        recommended: recommended as unknown as TSESLint.ClassicConfig.Config,
        "no-swagger": noSwagger as unknown as TSESLint.ClassicConfig.Config,
    },
    rules,
    meta,
};

export const plugin: TSESLint.FlatConfig.Plugin = classicPlugin as Omit<
    typeof classicPlugin,
    "configs"
>;
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
