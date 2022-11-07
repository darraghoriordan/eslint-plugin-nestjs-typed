/* eslint-disable unicorn/prevent-abbreviations */
import {
    AST_NODE_TYPES,
    TSESTree,
    ESLintUtils,
    TSESLint,
} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

const primitiveTypes = new Set([
    AST_NODE_TYPES.TSStringKeyword,
    AST_NODE_TYPES.TSBooleanKeyword,
    AST_NODE_TYPES.TSNumberKeyword,
]);
export type ValidateNonPrimitivePropertyTypeDecoratorOptions = [
    {
        additionalTypeDecorators: string[];
    }
];
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
                "A non-primitve property with validation should probably use a @Type decorator. If this is an enum use @IsEnum().",
        },
        schema: [
            {
                properties: {
                    additionalTypeDecorators: {
                        description:
                            "A list of custom type decorators that this rule will use to validate",
                        type: "array",
                        minItems: 0,
                        items: {
                            type: "string",
                            minLength: 1,
                        },
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [{additionalTypeDecorators: new Array<string>()}],

    create(
        context: Readonly<
            TSESLint.RuleContext<
                "shouldUseTypeDecorator",
                ValidateNonPrimitivePropertyTypeDecoratorOptions
            >
        >
    ) {
        const {additionalTypeDecorators} = context.options[0] || {
            additionalTypeDecorators: [],
        };

        const parserServices = ESLintUtils.getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                // if it's an array get the element type
                let mainType: AST_NODE_TYPES | undefined;
                const isAnArray =
                    typedTokenHelpers.isTypeArrayTypeOrUnionOfArrayTypes(
                        node,
                        parserServices,
                        typeChecker
                    );
                // this is getting very messy
                if (isAnArray) {
                    const mainTypeInShortArray = (
                        node.typeAnnotation
                            ?.typeAnnotation as TSESTree.TSArrayType
                    )?.elementType?.type;
                    if (!mainTypeInShortArray) {
                        // try to get the type of Array<type> syntax
                        const foundParams = (
                            node.typeAnnotation
                                ?.typeAnnotation as TSESTree.TSTypeReference
                        )?.typeParameters?.params;
                        if (foundParams && foundParams.length === 1) {
                            mainType = foundParams[0].type;
                        }
                    } else {
                        mainType = mainTypeInShortArray;
                    }
                } else {
                    mainType = node.typeAnnotation?.typeAnnotation?.type;
                }

                // if this couldn't be found we don't understand the AST
                if (!mainType) {
                    return;
                }

                // property is a primitive type - no need to validate
                const isNodeTypePrimitive = primitiveTypes.has(mainType);
                if (isNodeTypePrimitive) {
                    return;
                }

                // property is a union with primitive type - no need to validate
                const isNodeAUnionWithAPrimitive =
                    mainType === AST_NODE_TYPES.TSUnionType &&
                    (
                        node.typeAnnotation
                            ?.typeAnnotation as TSESTree.TSUnionType
                    ).types?.some((x) => primitiveTypes.has(x.type));
                if (isNodeAUnionWithAPrimitive) {
                    return;
                }

                // if this is an enum we don't need a type decorator
                const mappedNode =
                    parserServices.esTreeNodeToTSNodeMap.get(node);
                const objectType = typeChecker.getTypeAtLocation(mappedNode);

                if (typedTokenHelpers.isEnumType(objectType)) {
                    return;
                }

                // We have to make an assumption here. We assume that
                // if there is a validation decorator on the property, this is an input DTO.
                // And for input DTOs they should specify types.
                // property has a validation decorator but not IsEnum
                // (we don't care about un-validated properties and enums don't need Type())
                const foundClassValidatorDecorators =
                    typedTokenHelpers.getImportedClassValidatorDecorators(node);
                const hasEnum = foundClassValidatorDecorators.some(
                    (foundClassValidatorDecorator) =>
                        typedTokenHelpers.decoratorIsIsEnum(
                            foundClassValidatorDecorator
                        )
                );

                if (hasEnum) {
                    return;
                }

                // const foundClassValidatorDecorators =
                //     typedTokenHelpers.getDecoratorsNamed(
                //         node,
                //         classValidatorDecorators.filter((x) => x !== "IsEnum")
                //     );
                if (foundClassValidatorDecorators.length === 0) {
                    return;
                }

                // we add the supplied extra decorators from settings to the type decorators
                const typeDecorators = new Array<string>().concat(
                    additionalTypeDecorators, // these are user-specified extra type decorators, unique to user's project
                    ["Type"] //this is the default type decorator
                );

                // ok so does the property have Type decorator or custom type decorator? it probably should
                const foundTypeDecorator = typedTokenHelpers.getDecoratorsNamed(
                    node,
                    typeDecorators
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
