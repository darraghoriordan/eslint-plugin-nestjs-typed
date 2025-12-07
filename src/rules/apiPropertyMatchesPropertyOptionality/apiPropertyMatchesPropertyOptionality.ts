import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

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

export const hasRedundantRequired = (
    node: TSESTree.PropertyDefinition
): boolean => {
    const apiPropertyDecorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiProperty",
    ]);

    for (const decorator of apiPropertyDecorators) {
        if (
            decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression
        ) {
            const firstArgument = decorator.expression
                .arguments[0] as TSESTree.ObjectExpression;

            if (
                firstArgument &&
                firstArgument.type === TSESTree.AST_NODE_TYPES.ObjectExpression
            ) {
                const hasRequiredTrue =
                    typedTokenHelpers.getPropertyValueEqualsExpected(
                        firstArgument,
                        "required",
                        true
                    );

                if (hasRequiredTrue) {
                    return true;
                }
            }
        }
    }

    return false;
};

type Options = [
    {
        checkRedundantRequired?: boolean;
    },
];

const rule = createRule<
    Options,
    | "shouldUseOptionalDecorator"
    | "shouldUseRequiredDecorator"
    | "redundantRequired"
>({
    name: "api-property-matches-property-optionality",
    meta: {
        docs: {
            description:
                "Properties should have correct @ApiProperty decorators",
        },
        messages: {
            shouldUseOptionalDecorator: `Property marked as optional should use @ApiPropertyOptional decorator`,
            shouldUseRequiredDecorator: `Property marked as required should use @ApiProperty decorator`,
            redundantRequired: `Redundant 'required: true' in @ApiProperty. Properties are required by default.`,
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    checkRedundantRequired: {
                        description:
                            "Check for redundant 'required: true' in @ApiProperty (default: true)",
                        type: "boolean",
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [
        {
            checkRedundantRequired: true,
        },
    ],

    create(context) {
        const options = context.options[0] || {};
        const shouldCheckRedundantRequired =
            options.checkRedundantRequired ?? true;

        return {
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
                if (
                    shouldCheckRedundantRequired &&
                    hasRedundantRequired(node)
                ) {
                    context.report({
                        node: node,
                        messageId: "redundantRequired",
                    });
                }
            },
        };
    },
});

export default rule;
