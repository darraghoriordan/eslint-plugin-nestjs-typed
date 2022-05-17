import {ESLintUtils} from "@typescript-eslint/utils";

// Note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-var-requires, unicorn/prefer-module
//const {version} = require("../../package.json");
// eslint-disable-next-line new-cap
export const createRule = ESLintUtils.RuleCreator(
    // (name) =>
    //     `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/v${
    //         version as string
    //     }/packages/eslint-plugin/docs/rules/${name}.md`
    () =>
        `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/main/README.md`
);
