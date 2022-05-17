// Import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
// import * as tsutils from "tsutils";
// import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import {TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

export const shouldUseRequiredDecorator = (
    node: TSESTree.PropertyDefinition
): boolean => {
    const hasOptionalDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["ApiPropertyOptional"]
    );

    const isOptionalPropertyValue =
        typedTokenHelpers.isOptionalPropertyValue(node);

    return hasOptionalDecorator && !isOptionalPropertyValue;
};

export const shouldUseOptionalDecorator = (
    node: TSESTree.PropertyDefinition
): boolean => {
    const hasRequiredDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["ApiProperty"]
    );

    const isOptionalPropertyValue =
        typedTokenHelpers.isOptionalPropertyValue(node);

    return hasRequiredDecorator && isOptionalPropertyValue;
};

const rule = createRule({
    name: "api-property-matches-property-optionality",
    meta: {
        docs: {
            description:
                "Properties should have correct @ApiProperty decorators",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldUseOptionalDecorator: `Property marked as optional should use @ApiPropertyOptional decorator`,
            shouldUseRequiredDecorator: `Property marked as required should use @ApiProperty decorator`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(
        context: Readonly<
            TSESLint.RuleContext<
                "shouldUseOptionalDecorator" | "shouldUseRequiredDecorator",
                never[]
            >
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                if (shouldUseOptionalDecorator(node)) {
                    context.report({
                        node: node,
                        messageId: "shouldUseOptionalDecorator",
                    });
                }
                if (shouldUseRequiredDecorator(node)) {
                    context.report({
                        node: node,
                        messageId: "shouldUseRequiredDecorator",
                    });
                }
            },
        };
    },
});

export default rule;
