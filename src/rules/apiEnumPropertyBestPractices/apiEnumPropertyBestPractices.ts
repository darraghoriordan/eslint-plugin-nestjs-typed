import {ESLintUtils, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";
import {EnumTestResultModel} from "./enumTestResultModel.js";

const noChangesRequiredResult = new EnumTestResultModel({
    needsEnumAdded: false,
    needsEnumNameAdded: false,
    needsEnumNameToMatchEnumType: false,
    needsTypeRemoved: false,
});

export const hasEnumSpecifiedCorrectly = (
    node: TSESTree.Node,
    isEnumType: boolean
): EnumTestResultModel => {
    // is this an enum
    if (!isEnumType) {
        return noChangesRequiredResult;
    }

    // is this decorated with api documentation
    const decorators = typedTokenHelpers.getDecoratorsNamed(
        node as TSESTree.PropertyDefinition,
        ["ApiPropertyOptional", "ApiProperty"]
    );

    if (decorators.length === 0) {
        return noChangesRequiredResult;
    }

    // check if there is an enum property in the provided options (enums should specify the enum property)
    const firstArgument = (decorators[0].expression as TSESTree.CallExpression)
        .arguments[0] as TSESTree.ObjectExpression;

    const enumProperty = firstArgument?.properties?.find(
        (p) =>
            ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
            "enum"
    );

    // check if there is a type: property in the provided options (enums shouldn't specify type)
    const hasTypeProperty =
        firstArgument?.properties?.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "type"
        ) !== undefined;

    // check if there is an enumName: property in the provided options (enums should specify a name)
    const enumNameProperty = firstArgument?.properties?.find(
        (p) =>
            ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
            "enumName"
    );
    return new EnumTestResultModel({
        needsEnumAdded: enumProperty === undefined,
        needsEnumNameAdded: enumNameProperty === undefined,
        needsEnumNameToMatchEnumType: needsEnumNameMatchingEnumType(
            enumNameProperty as TSESTree.Property,
            enumProperty as TSESTree.Property
        ),
        needsTypeRemoved: hasTypeProperty,
    });
};

export const needsEnumNameMatchingEnumType = (
    enumNameProperty: TSESTree.Property,
    enumProperty: TSESTree.Property
): boolean => {
    // if enum props aren't specified we don't care about this scenario
    if (enumNameProperty === undefined || enumProperty === undefined) {
        return false;
    }

    const isEnumNameMatchingEnumType =
        (enumNameProperty.value as TSESTree.Literal).value ===
        (enumProperty.value as TSESTree.Identifier)?.name;

    return !isEnumNameMatchingEnumType;
};

const rule = createRule<
    [],
    | "needsEnumAdded"
    | "needsEnumNameAdded"
    | "needsTypeRemoved"
    | "enumNameShouldMatchType"
>({
    name: "api-enum-property-best-practices",
    meta: {
        docs: {
            description:
                "Enums should use the best practices for api documentation",
        },
        messages: {
            needsEnumAdded: `Enum properties should specify an enum`,
            needsEnumNameAdded: `Properties with enum should also specify an enumName property to keep generated models clean`,
            needsTypeRemoved: `Properties with enum should not specify a type property`,
            enumNameShouldMatchType: `The enumName should match the enum type provided`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        //const globalScope = context.getScope();
        const parserServices = ESLintUtils.getParserServices(context);
        const typeChecker = parserServices.program.getTypeChecker();

        return {
            PropertyDefinition(node: TSESTree.Node): void {
                const mappedNode =
                    parserServices.esTreeNodeToTSNodeMap.get(node);
                const objectType = typeChecker.getTypeAtLocation(mappedNode);
                const isEnumType = typedTokenHelpers.isEnumType(objectType);

                const result = hasEnumSpecifiedCorrectly(node, isEnumType);
                if (result.needsEnumAdded) {
                    context.report({
                        node: node,
                        messageId: "needsEnumAdded",
                    });
                }
                if (result.needsEnumNameAdded) {
                    context.report({
                        node: node,
                        messageId: "needsEnumNameAdded",
                    });
                }
                if (result.needsTypeRemoved) {
                    context.report({
                        node: node,
                        messageId: "needsTypeRemoved",
                    });
                }
                if (result.needsEnumNameToMatchEnumType) {
                    context.report({
                        node: node,
                        messageId: "enumNameShouldMatchType",
                    });
                }
            },
        };
    },
});

export default rule;
