import {AST_NODE_TYPES, TSESLint} from "@typescript-eslint/utils";
import {PropertyDefinition} from "@typescript-eslint/types/dist/generated/ast-spec";
import {createRule} from "../../utils/createRule";
import {typeCheckingDecorator} from "../../utils/classValidatorDecorators";

const rule = createRule({
    name: "all-defined-property-must-be-decored",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit IsDefined decorator or type checking decorator",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            "missing-is-defined-decorator":
                "Defined properties must have @IsDefined() decorator or a type checking decorator",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"missing-is-defined-decorator", never[]>
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(propertyDefinition) {
                if (propertyDefinition.optional) return;
                if (!hasValidDecorator(propertyDefinition))
                    context.report({
                        messageId: "missing-is-defined-decorator",
                        node: propertyDefinition.key,
                    });
                return;
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
