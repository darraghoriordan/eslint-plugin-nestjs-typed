import {Linter} from "eslint";

// Should turn off swagger rules for folks not using swagger typings
export const rules: Partial<Linter.RulesRecord> = {
    "@darraghor/nestjs-typed/api-property-matches-property-optionality": "off",
    "@darraghor/nestjs-typed/api-method-should-specify-api-response": "off",
    "@darraghor/nestjs-typed/api-method-should-specify-api-operation": "off",
    "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "off",
    "@darraghor/nestjs-typed/api-enum-property-best-practices": "off",
    "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
        "off",
};

export default {
    extends: ["./configs/base"],
    rules,
};
