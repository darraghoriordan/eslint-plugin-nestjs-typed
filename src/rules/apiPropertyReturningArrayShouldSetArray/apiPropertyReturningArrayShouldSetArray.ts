import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import ArraySetResultModel from "./arraySetResultModel";

export const shouldSetArrayProperty = (
    node: TSESTree.PropertyDefinition
): ArraySetResultModel => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiPropertyOptional",
        "ApiProperty",
    ]);

    if (decorators.length === 0) {
        return new ArraySetResultModel(false, false);
    }

    // There should only be one of these apiproperty decorators so we just grab the parameter to decorator at index 0
    const firstArgumentToDecorator = (
        decorators[0].expression as TSESTree.CallExpression
    ).arguments[0];

    // if the code is using anything other than object expression, ignore the rule (we dont want to go looking at objects)
    // we DO want to alert if there is no argument at all. so we continue to test the rule if no argument was passed
    if (
        firstArgumentToDecorator &&
        (firstArgumentToDecorator.type !== AST_NODE_TYPES.ObjectExpression ||
            // if the things passed to the object expression contains a spread then ignore that too!
            firstArgumentToDecorator.properties.some(
                (x) => x.type === AST_NODE_TYPES.SpreadElement
            ))
    ) {
        return new ArraySetResultModel(false, false);
    }

    const hasIsArraySetInOptions =
        typedTokenHelpers.getPropertyValueEqualsExpected(
            firstArgumentToDecorator,
            "isArray",
            true
        );

    const typeAnnotation = node.typeAnnotation?.typeAnnotation;
    // handle string[] or Array<string>
    const isArrayType =
        (
            (typeAnnotation as TSESTree.TSTypeReference | undefined)
                ?.typeName as TSESTree.Identifier
        )?.name === "Array";
    const isTypescriptArrayType =
        typeAnnotation?.type === AST_NODE_TYPES.TSArrayType;
    const isAnArrayLikeType = isArrayType || isTypescriptArrayType;

    return new ArraySetResultModel(
        isAnArrayLikeType && !hasIsArraySetInOptions,
        !isAnArrayLikeType && hasIsArraySetInOptions
    );
};

const rule = createRule<
    [],
    "shouldSetArrayPropertyTrue" | "shouldSetArrayPropertyFalse"
>({
    name: "api-property-returning-array-should-set-array",
    meta: {
        docs: {
            description: "Properties of array should set array",

            requiresTypeChecking: false,
        },
        messages: {
            shouldSetArrayPropertyTrue: `Property returning array should set array option property true`,
            shouldSetArrayPropertyFalse: `Property not returning array should not set array option property true`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition: (node: TSESTree.Node) => {
                const shouldSetArrayResults = shouldSetArrayProperty(
                    node as TSESTree.PropertyDefinition
                );

                if (shouldSetArrayResults.isArrayShouldBeSetFalse) {
                    context.report({
                        node: node,
                        messageId: "shouldSetArrayPropertyFalse",
                    });
                }
                if (shouldSetArrayResults.isArrayShouldBeSetTrue) {
                    context.report({
                        node: node,
                        messageId: "shouldSetArrayPropertyTrue",
                    });
                }
            },
        };
    },
});

export default rule;
