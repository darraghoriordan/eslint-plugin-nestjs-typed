import {
    PropertyDefinition,
    Decorator,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import {AST_NODE_TYPES, TSESLint} from "@typescript-eslint/utils";
import {classValidatorDecoratorsConflicts} from "../../utils/classValidatorDecorators";
import {createRule} from "../../utils/createRule";

const rule = createRule({
    name: "no-conflicting-decorators",
    meta: {
        docs: {
            description: "Error when two decorators are colliding",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "conflicting-decorators":
                "Two or more decorators are conflicting with each other.",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"conflicting-decorators", never[]>
        >
    ) {
        return {
            PropertyDefinition(propertyDefinition) {
                if (isConflicting(propertyDefinition)) {
                    context.report({
                        node: propertyDefinition,
                        messageId: "conflicting-decorators",
                    });
                    return;
                }
            },
        };
    },
});

export default rule;

function isConflicting(propertyDefinition: PropertyDefinition): boolean {
    let isConflicting = false;
    if (!propertyDefinition.decorators) return false;
    const decorators = getDecoratorsNames(propertyDefinition.decorators);
    for (const decorator of decorators)
        if (
            classValidatorDecoratorsConflicts[decorator]?.some((decorator) =>
                decorators.includes(decorator)
            )
        )
            isConflicting = true;
    return isConflicting;
}

const getDecoratorsNames = (decorators: Decorator[]): Array<string> => {
    return decorators
        .map((decorator) => {
            if (
                decorator.expression.type === AST_NODE_TYPES.CallExpression &&
                decorator.expression.callee.type === AST_NODE_TYPES.Identifier
            )
                return decorator.expression.callee.name;
            return null;
        })
        .filter(
            (decoratorName): decoratorName is string => decoratorName !== null
        );
};
