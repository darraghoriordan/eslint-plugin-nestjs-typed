import {
    PropertyDefinition,
    Decorator,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import {AST_NODE_TYPES, TSESLint} from "@typescript-eslint/utils";
import {getPropertiesDefinitions} from "../../utils/ast";
import {classValidatorDecoratorsConflicts} from "../../utils/classValidatorDecorators";
import {createRule} from "../../utils/createRule";

const rule = createRule({
    name: "no-conflicting-decorators",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit defined status decorator",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            "conflicting-defined-decorators":
                "Two or more decorators are conflicting with each other.",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"conflicting-defined-decorators", never[]>
        >
    ) {
        return {
            ClassDeclaration(node) {
                const propertyDefinitions = getPropertiesDefinitions(node);
                for (const propertyDefinition of propertyDefinitions) {
                    if (isConflicting(propertyDefinition)) {
                        context.report({
                            node: propertyDefinition,
                            messageId: "conflicting-defined-decorators",
                        });
                    }
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
