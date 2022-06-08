import {AST_NODE_TYPES} from "@typescript-eslint/utils";
import {PropertyDefinition} from "@typescript-eslint/types/dist/generated/ast-spec";
import {getPropertiesDefinitions} from "../../utils/ast";
import {createRule} from "../../utils/createRule";

const rule = createRule({
    name: "all-optionnal-property-must-be-decored",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit defined status decorator",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            "missing-is-optional-decorator":
                "Optional properties must have @IsOptional() decorator",
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
                    if (!propertyDefinition.optional) continue;
                    if (isMissingIsOptionnalDecorator(propertyDefinition))
                        context.report({
                            messageId: "missing-is-optional-decorator",
                            node: propertyDefinition.key,
                        });
                }
            },
        };
    },
});

export default rule;

function isMissingIsOptionnalDecorator(
    propertyDefinition: PropertyDefinition
): boolean {
    let isMissingIsOptionnalDecorator = true;
    if (propertyDefinition.decorators) {
        for (const decorator of propertyDefinition.decorators) {
            if (
                decorator.expression.type === AST_NODE_TYPES.CallExpression &&
                decorator.expression.callee.type ===
                    AST_NODE_TYPES.Identifier &&
                decorator.expression.callee.name === "IsOptional"
            ) {
                isMissingIsOptionnalDecorator = false;
            }
        }
    }
    return isMissingIsOptionnalDecorator;
}
