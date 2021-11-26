/* eslint-disable unicorn/prevent-abbreviations */
import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/types";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {getParserServices} from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import {classValidatorDecorators} from "../../utils/classValidatorDecorators";

const primitiveTypes = new Set([
    AST_NODE_TYPES.TSStringKeyword,
    AST_NODE_TYPES.TSBooleanKeyword,
    AST_NODE_TYPES.TSNumberKeyword,
]);
export const shouldTrigger = (): boolean => {
    return true;
};

const rule = createRule({
    name: "validated-non-primitive-property-needs-type-decorator",
    meta: {
        docs: {
            description:
                "A non-primitve property with validation should probably use a @Type decorator",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldUseTypeDecorator:
                "A non-primitve property with validation should probably use a @Type decorator",
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        const parserServices = getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                // property is not a primitive type

                const isNodeTypePrimitive =
                    node.typeAnnotation?.typeAnnotation?.type &&
                    primitiveTypes.has(
                        node.typeAnnotation?.typeAnnotation?.type
                    );
                if (isNodeTypePrimitive) {
                    return;
                }

                const isNodeAUnionWithAPrimitive =
                    node.typeAnnotation?.typeAnnotation?.type ===
                        AST_NODE_TYPES.TSUnionType &&
                    node.typeAnnotation?.typeAnnotation?.types.some((x) =>
                        primitiveTypes.has(x.type)
                    );
                if (isNodeAUnionWithAPrimitive) {
                    return;
                }
                // if this is an enum we don't need a type
                const mappedNode =
                    parserServices.esTreeNodeToTSNodeMap.get(node);
                const objectType = typeChecker.getTypeAtLocation(mappedNode);

                if (typedTokenHelpers.isEnumType(objectType)) {
                    return;
                }
                // We have to make an assumption here. We assume that if there is a validation decorator on the property, this is an input DTO.
                // And for input DTOs they should specify types.
                // property has a validation decorator but not IsEnum (we don't care about un-validated properties and enums don't need Type())
                const foundClassValidatorDecorators =
                    typedTokenHelpers.getDecoratorsNamed(
                        node,
                        classValidatorDecorators.filter((x) => x !== "IsEnum")
                    );
                if (foundClassValidatorDecorators.length === 0) {
                    return;
                }

                // ok so does the property have Type decorator? it probably should
                const foundTypeDecorator = typedTokenHelpers.getDecoratorsNamed(
                    node,
                    ["Type"]
                );

                if (foundTypeDecorator.length === 0) {
                    context.report({
                        node: node,
                        messageId: "shouldUseTypeDecorator",
                    });
                }
            },
        };
    },
});

export default rule;
