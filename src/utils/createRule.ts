import {ESLintUtils} from "@typescript-eslint/utils";

// Note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
 
//const {version} = require("../../package.json");
 
export const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/main/src/docs/rules/${name}.md`
);
