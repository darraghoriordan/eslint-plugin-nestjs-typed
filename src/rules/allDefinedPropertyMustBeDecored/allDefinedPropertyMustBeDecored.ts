import {AST_NODE_TYPES} from "@typescript-eslint/utils";
import {PropertyDefinition} from "@typescript-eslint/types/dist/generated/ast-spec";
import {getPropertiesDefinitions} from "../../utils/ast";
import {createRule} from "../../utils/createRule";
import {typeCheckingDecorator} from "../../utils/classValidatorDecorators";

const rule = createRule({
    name: "all-defined-property-must-be-decored",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit IsDefined decorator",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            "missing-is-defined-decorator":
                "Non-optional properties must have a decorator that checks the value is defined (for example: @IsDefined())",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node) {
                const propertyDefinitions = getPropertiesDefinitions(node);
                for (const propertyDefinition of propertyDefinitions) {
                    if (propertyDefinition.optional) continue;
                    if (!hasValidDecorator(propertyDefinition))
                        context.report({
                            messageId: "missing-is-defined-decorator",
                            node: propertyDefinition.key,
                        });
                }
            },
        };
    },
});

export default rule;

function hasValidDecorator(propertyDefinition: PropertyDefinition): boolean {
    let hasValidDecorator = false;
    if (!propertyDefinition.decorators) return hasValidDecorator;
    for (const decorator of propertyDefinition.decorators) {
        if (
            decorator.expression.type === AST_NODE_TYPES.CallExpression &&
            decorator.expression.callee.type === AST_NODE_TYPES.Identifier &&
            (decorator.expression.callee.name === "IsDefined" ||
                typeCheckingDecorator.includes(
                    decorator.expression.callee.name
                ))
        ) {
            hasValidDecorator = true;
        }
    }
    return hasValidDecorator;
}
