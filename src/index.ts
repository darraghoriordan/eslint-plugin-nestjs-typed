import type {Linter} from "@typescript-eslint/utils/ts-eslint";
import configs from "./configs";
import rules from "./rules";

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

export default {
    configs: {
        recommended: configs.recommended,
        "no-swagger": configs["no-swagger"],
    },
    rules,
    meta,
} satisfies Linter.Plugin;
