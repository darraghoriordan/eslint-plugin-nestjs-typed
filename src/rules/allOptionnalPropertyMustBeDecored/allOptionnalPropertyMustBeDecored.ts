import {AST_NODE_TYPES, TSESLint} from "@typescript-eslint/utils";
import {PropertyDefinition} from "@typescript-eslint/types/dist/generated/ast-spec";
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
        fixable: "code",
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"missing-is-optional-decorator", never[]>
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(propertyDefinition) {
                if (!propertyDefinition.optional) return;
                if (isMissingIsOptionnalDecorator(propertyDefinition))
                    context.report({
                        messageId: "missing-is-optional-decorator",
                        node: propertyDefinition.key,
                        fix: (fixer: TSESLint.RuleFixer) =>
                            fixer.insertTextBefore(
                                propertyDefinition,
                                "@IsOptional() "
                            ),
                    });
                return;
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
