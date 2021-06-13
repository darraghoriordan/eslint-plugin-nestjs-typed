import {TSESTree} from "@typescript-eslint/types";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {EnumTestResultModel} from "./enumTestResultModel";

export const hasEnumSpecifiedCorrectly = (
    node: TSESTree.ClassProperty
): EnumTestResultModel => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiPropertyOptional",
        "ApiProperty",
    ]);

    if (decorators.length === 0) {
        return new EnumTestResultModel(false, false, false);
    }

    const firstArgument = (decorators[0].expression as TSESTree.CallExpression)
        .arguments[0] as TSESTree.ObjectExpression;
    if (!firstArgument) {
        return new EnumTestResultModel(false, false, false);
    }
    // is it an enum prop?
    // OK so this could be changed later to actually parse the property's type for an enum
    // and so check if enum: is needed too. However we don't do this yet so we depend on enum having
    // been added already and this rule just recommends keeping it tidy. So, you will still have to at
    // least remember to add "enum: Blah" to your api decorator.
    const enumProperty = firstArgument.properties.find(
        (p) =>
            ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
            "enum"
    );

    if (enumProperty === undefined) {
        return new EnumTestResultModel(false, false, false);
    }

    // now check the rules
    // check if there is a type: property in the provided options
    const hasTypeProperty =
        firstArgument.properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "type"
        ) !== undefined;

    // check if there is an enumName: property in the provided options
    const enumNameProperty = firstArgument.properties.find(
        (p) =>
            ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
            "enumName"
    );

    return new EnumTestResultModel(
        hasTypeProperty,
        enumNameProperty === undefined,
        needsEnumNameMatchingEnumType(
            enumNameProperty as TSESTree.Property,
            enumProperty as TSESTree.Property
        )
    );
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
        (enumProperty.value as TSESTree.Identifier).name;

    return !isEnumNameMatchingEnumType;
};

const rule = createRule({
    name: "api-enum-property-best-practices",
    meta: {
        docs: {
            description:
                "Enums should use the best practices for api documentation",
            category: "Best Practices",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            needsEnumNameAdded: `Properties with enum should also specify an enumName property to keep generated models clean`,
            needsTypeRemoved: `Properties with enum should not specify a type property`,
            enumNameShouldMatchType: `The enumName should match the enum type provided`,
        },
        schema: [],
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassProperty(node: TSESTree.ClassProperty): void {
                const result = hasEnumSpecifiedCorrectly(node);
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
