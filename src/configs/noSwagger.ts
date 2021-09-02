// Should turn off swagger rules for folks not using swagger typings
export = {
    parser: "@typescript-eslint/parser",
    parserOptions: {sourceType: "module"},
    rules: {
        "@darraghor/nestjs-typed/api-property-matches-property-optionality":
            "off",
        "@darraghor/nestjs-typed/api-method-should-specify-api-response":
            "off",
        "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "off",
        "@darraghor/nestjs-typed/api-enum-property-best-practices": "off",
        "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
            "off",
    },
};
