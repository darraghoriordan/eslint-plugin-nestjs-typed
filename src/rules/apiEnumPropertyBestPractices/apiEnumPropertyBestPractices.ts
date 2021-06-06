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
        return new EnumTestResultModel(false, false);
    }

    const firstArgument = (decorators[0].expression as TSESTree.CallExpression)
        .arguments[0] as TSESTree.ObjectExpression;
    if (!firstArgument) {
        return new EnumTestResultModel(false, false);
    }
    // is it an enum prop?
    // OK so this could be changed later to actually parse the property type for an enum
    // and so check if enum: is needed too. However we don't do this yet so we depend on enum having
    // been added already and this rule just recommends keeping it tidy. So, you will still have to at
    // least remember to add "enum: Blah" to your api decorator.
    const hasEnumProperty =
        firstArgument.properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "enum"
        ) !== undefined;

    if (!hasEnumProperty) {
        return new EnumTestResultModel(false, false);
    }
    const hasTypeProperty =
        firstArgument.properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "type"
        ) !== undefined;
    const hasEnumNameProperty =
        firstArgument.properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                "enumName"
        ) !== undefined;

    return new EnumTestResultModel(hasTypeProperty, !hasEnumNameProperty);
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
            },
        };
    },
});

export default rule;
