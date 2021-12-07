import {AST_NODE_TYPES} from "@typescript-eslint/experimental-utils";
import {PropertyDefinition} from "@typescript-eslint/types/dist/ast-spec";
import * as classValidator from "class-validator";
import {createRule} from "../../utils/createRule";

const CLASS_VALIDATOR_DECORATOR_NAMES = new Set(
    Object.keys(classValidator as object)
);

const rule = createRule({
    name: "no-whitelisted-properties",
    meta: {
        docs: {
            description: "Enforce no properties are whitelisted",
            recommended: "error",
            requiresTypeChecking: false,
        },
        messages: {
            "missing-property-decorator":
                "Property has no class-validator decorator (use @Allow so it would not be whitelisted)",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node) {
                const withDecorator: PropertyDefinition[] = [];
                const withoutDecorator: PropertyDefinition[] = [];
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
