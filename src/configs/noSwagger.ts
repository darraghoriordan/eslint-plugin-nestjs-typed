import {TSESLint} from "@typescript-eslint/utils";

// Should turn off swagger rules for folks not using swagger typings
export const rules: Partial<TSESLint.ClassicConfig.RulesRecord> = {
    "@darraghor/nestjs-typed/api-property-matches-property-optionality": "off",
    "@darraghor/nestjs-typed/api-method-should-specify-api-response": "off",
    "@darraghor/nestjs-typed/api-method-should-specify-api-operation": "off",
    "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "off",
    "@darraghor/nestjs-typed/api-enum-property-best-practices": "off",
    "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
        "off",
};

const config = {
    extends: ["./configs/base"],
    rules,
};

export default config as TSESLint.ClassicConfig.Config;
