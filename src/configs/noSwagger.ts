// Should turn off swagger rules for folks not using swagger typings
export = {
    parser: "@typescript-eslint/parser",
    parserOptions: {sourceType: "module"},
    rules: {
        "@darraghor/nestjs-typed/api-property-matches-property-optionality":
            "off",
        "@darraghor/nestjs-typed/api-method-should-specify-api-operation":
            "off",
        "@darraghor/nestjs-typed/controllers-should-supply-api-tags": "off",
    },
};
