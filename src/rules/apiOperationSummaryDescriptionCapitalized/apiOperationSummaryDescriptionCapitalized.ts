import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

const isCapitalized = (text: string): boolean => {
    if (!text || text.length === 0) {
        return true; // Empty strings pass validation
    }
    const firstChar = text.charAt(0);
    // If the first character is not a letter, consider it valid (e.g., numbers, special chars)
    if (
        firstChar === firstChar.toUpperCase() &&
        firstChar === firstChar.toLowerCase()
    ) {
        return true;
    }
    // Check if the first letter is uppercase
    return firstChar === firstChar.toUpperCase();
};

const getStringPropertyValue = (
    objectExpression: TSESTree.ObjectExpression,
    propertyName: string
): string | null => {
    const property = objectExpression.properties.find(
        (p) =>
            p.type === TSESTree.AST_NODE_TYPES.Property &&
            (p.key as TSESTree.Identifier).name === propertyName
    );

    if (
        property &&
        property.type === TSESTree.AST_NODE_TYPES.Property &&
        property.value.type === TSESTree.AST_NODE_TYPES.Literal &&
        typeof property.value.value === "string"
    ) {
        return property.value.value;
    }

    return null;
};

const checkApiOperationDecorator = (
    node: TSESTree.MethodDefinition
): {property: string; value: string; decorator: TSESTree.Decorator}[] => {
    const issues: {
        property: string;
        value: string;
        decorator: TSESTree.Decorator;
    }[] = [];

    const apiOperationDecorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiOperation",
    ]);

    for (const decorator of apiOperationDecorators) {
        if (
            decorator.expression.type === TSESTree.AST_NODE_TYPES.CallExpression
        ) {
            const firstArgument = decorator.expression.arguments[0];

            if (
                firstArgument &&
                firstArgument.type === TSESTree.AST_NODE_TYPES.ObjectExpression
            ) {
                // Check summary property
                const summary = getStringPropertyValue(
                    firstArgument,
                    "summary"
                );
                if (summary && !isCapitalized(summary)) {
                    issues.push({
                        property: "summary",
                        value: summary,
                        decorator,
                    });
                }

                // Check description property
                const description = getStringPropertyValue(
                    firstArgument,
                    "description"
                );
                if (description && !isCapitalized(description)) {
                    issues.push({
                        property: "description",
                        value: description,
                        decorator,
                    });
                }
            }
        }
    }

    return issues;
};

const rule = createRule<[], "shouldBeCapitalized">({
    name: "api-operation-summary-description-capitalized",
    meta: {
        docs: {
            description:
                "ApiOperation summary and description should start with an uppercase letter.",
        },
        messages: {
            shouldBeCapitalized: `The {{property}} in @ApiOperation should start with an uppercase letter. Found: "{{value}}"`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                const issues = checkApiOperationDecorator(node);

                for (const issue of issues) {
                    context.report({
                        node: issue.decorator,
                        messageId: "shouldBeCapitalized",
                        data: {
                            property: issue.property,
                            value: issue.value,
                        },
                    });
                }
            },
        };
    },
});

export default rule;
