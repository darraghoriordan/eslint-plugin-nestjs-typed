import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";
import ArraySetResultModel from "./arraySetResultModel.js";

export const shouldSetArrayProperty = (
    node: TSESTree.PropertyDefinition
): ArraySetResultModel => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ValidateNested",
    ]);

    if (decorators.length === 0) {
        return new ArraySetResultModel(false, false);
    }

    const firstArgumentToDecorator = (
        decorators[0].expression as TSESTree.CallExpression
    ).arguments[0] as TSESTree.ObjectExpression;

    const hasEachSetInOptions =
        typedTokenHelpers.getPropertyValueEqualsExpected(
            firstArgumentToDecorator,
            "each",
            true
        );
    // handle string[] or Array<string>
    const isArrayType =
        (
            (node.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference)
                .typeName as TSESTree.Identifier
        )?.name === "Array";
    const isTypescriptArrayType =
        node.typeAnnotation?.typeAnnotation.type === AST_NODE_TYPES.TSArrayType;
    const isAnArrayLikeType = isArrayType || isTypescriptArrayType;

    return new ArraySetResultModel(
        isAnArrayLikeType && !hasEachSetInOptions,
        !isAnArrayLikeType && hasEachSetInOptions
    );
};

const rule = createRule<
    [],
    "shouldSetEachPropertyTrue" | "shouldSetEachPropertyFalse"
>({
    name: "validate-nested-of-array-should-set-each",
    meta: {
        docs: {
            description:
                "If you set ValidateNested() on an array, you should set {each: true} in the options",
        },
        messages: {
            shouldSetEachPropertyTrue: `ValidateNested should have {each: true} when used on an array`,
            shouldSetEachPropertyFalse: `ValidateNested should not have {each: true} when used on non-arrays. Note: If this is a custom array class please ignore this suggestion, you should validate each in that case.`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            PropertyDefinition: (node: TSESTree.Node) => {
                const shouldSetArrayResults = shouldSetArrayProperty(
                    node as TSESTree.PropertyDefinition
                );

                if (shouldSetArrayResults.isArrayShouldBeSetFalse) {
                    context.report({
                        node: node,
                        messageId: "shouldSetEachPropertyFalse",
                    });
                }
                if (shouldSetArrayResults.isArrayShouldBeSetTrue) {
                    context.report({
                        node: node,
                        messageId: "shouldSetEachPropertyTrue",
                    });
                }
            },
        };
    },
});

export default rule;
