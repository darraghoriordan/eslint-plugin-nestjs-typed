import {AST_NODE_TYPES, TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {classValidatorDecorators} from "../../utils/classValidatorDecorators";

const CLASS_VALIDATOR_DECORATOR_NAMES = new Set(classValidatorDecorators);

const rule = createRule({
    name: "all-properties-are-whitelisted",
    meta: {
        docs: {
            description: "Enforce all properties are whitelisted",
            recommended: "error",
            requiresTypeChecking: false,
        },
        messages: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "missing-property-decorator":
                "Property has no class-validator decorator (use @Allow() if you don't need a validation)",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"missing-property-decorator", never[]>
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node) {
                const withDecorator: TSESTree.PropertyDefinition[] = [];
                const withoutDecorator: TSESTree.PropertyDefinition[] = [];
                for (const element of node.body.body) {
                    if (element.type !== AST_NODE_TYPES.PropertyDefinition) {
                        continue;
                    }
                    const hasDecorator = element.decorators?.some(
                        (decorator) =>
                            decorator.expression.type ===
                                AST_NODE_TYPES.CallExpression &&
                            decorator.expression.callee.type ===
                                AST_NODE_TYPES.Identifier &&
                            CLASS_VALIDATOR_DECORATOR_NAMES.has(
                                decorator.expression.callee.name
                            )
                    );
                    if (hasDecorator) {
                        withDecorator.push(element);
                    } else {
                        withoutDecorator.push(element);
                    }
                }
                if (withDecorator.length > 0 && withoutDecorator.length > 0) {
                    for (const element of withoutDecorator) {
                        context.report({
                            node: element,
                            messageId: "missing-property-decorator",
                        });
                    }
                }
            },
        };
    },
});

export default rule;
