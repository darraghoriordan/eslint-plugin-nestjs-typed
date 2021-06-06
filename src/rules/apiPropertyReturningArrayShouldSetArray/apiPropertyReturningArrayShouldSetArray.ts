import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/types";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import ArraySetResultModel from "./arraySetResultModel";

export const shouldSetArrayProperty = (
    node: TSESTree.ClassProperty
): ArraySetResultModel => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiPropertyOptional",
        "ApiProperty",
    ]);

    if (decorators.length === 0) {
        return new ArraySetResultModel(false, false);
    }

    const firstArgument = (decorators[0].expression as TSESTree.CallExpression)
        .arguments[0] as TSESTree.ObjectExpression;
    let isArraySet = false;
    if (firstArgument !== undefined) {
        const isArrayProperty = firstArgument.properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "isArray"
        );

        isArraySet =
            isArrayProperty !== undefined &&
            ((isArrayProperty as TSESTree.Property).value as TSESTree.Literal)
                .value === true;
    }
    // handle string[] or Array<string>
    const isArrayType =
        (
            (node.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference)
                .typeName as TSESTree.Identifier
        )?.name === "Array";
    const isTypescriptArrayType =
        node.typeAnnotation?.typeAnnotation.type === AST_NODE_TYPES.TSArrayType;
    const shouldArrayBeSet = isArrayType || isTypescriptArrayType;

    // this is verbose but makes it easier to read imho
    return new ArraySetResultModel(
        shouldArrayBeSet && isArraySet === false,
        shouldArrayBeSet === false && isArraySet
    );
};

const rule = createRule({
    name: "api-property-returning-array-should-set-array",
    meta: {
        docs: {
            description: "Properties of array should set array",
            category: "Best Practices",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldSetArrayPropertyTrue: `Property returning array should set array option property true`,
            shouldSetArrayPropertyFalse: `Property not returning array should not set array option property true`,
        },
        schema: [],
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassProperty(node: TSESTree.ClassProperty): void {
                const shouldSetArrayResults = shouldSetArrayProperty(node);
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
