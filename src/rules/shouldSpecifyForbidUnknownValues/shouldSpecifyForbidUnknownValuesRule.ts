import {ASTUtils, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";

export const isValidationPipeNewExpression = (node: TSESTree.Node): boolean => {
    const newExpression = node as TSESTree.NewExpression;
    const callee = newExpression.callee as TSESTree.Identifier;
    if (callee && callee.name === "ValidationPipe") {
        return true;
    }
    return false;
};
export const checkObjectExpression = (
    os: TSESTree.ObjectExpression
): boolean => {
    if (!os) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const forbidUnknownValuesProperty = os.properties
        .filter(ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.Property))
        .find(
            (p) => (p.key as TSESTree.Identifier).name === "forbidUnknownValues"
        ) as TSESTree.Property;
    // property is not present. this is wrong.
    if (os && !forbidUnknownValuesProperty) {
        return true;
    }
    // property is explicitly false. this is wrong.
    const isPropertyValueExplicitlyFalse =
        (forbidUnknownValuesProperty.value as TSESTree.Literal).raw === "false";
    if (isPropertyValueExplicitlyFalse) {
        return true;
    }
    // otherwise ignore this. we don't know the value.
    return false;
};

export const shouldTriggerNewExpressionHasProperty = (
    node: TSESTree.Node
): boolean => {
    // only look at ValidationPipe expressions
    if (!isValidationPipeNewExpression(node)) {
        return false;
    }
    const newExpression = node as TSESTree.NewExpression;
    // the default new ValidationPipe() seems to prevent the attack so we ignore calls with no parameters
    // we also ignore parameters that are not explicit object expressions
    // or if the properties are spread
    if (
        newExpression.arguments.length === 0 ||
        newExpression.arguments[0].type !==
            TSESTree.AST_NODE_TYPES.ObjectExpression ||
        newExpression.arguments[0].properties.some(
            ASTUtils.isNodeOfType(TSESTree.AST_NODE_TYPES.SpreadElement)
        )
    ) {
        return false;
    }
    const argument = newExpression?.arguments[0];

    return checkObjectExpression(argument);
};

export const shouldTriggerForVariableDeclaratorExpression = (
    node: TSESTree.VariableDeclarator
): boolean => {
    // if the developer hasn't annotated the object we can't continue to check these rules correctly (we don't know if anonymous objects need to have any props)
    const variableDeclarator = node;
    const asExpression = variableDeclarator.init as TSESTree.TSAsExpression;
    const typeAnnotation =
        asExpression?.typeAnnotation as TSESTree.TSTypeReference;
    const typeName =
        typeAnnotation && (typeAnnotation?.typeName as TSESTree.Identifier);
    if (typeName === undefined || typeName.name !== "ValidationPipeOptions") {
        return false;
    }
    // otherwise check the object expression is what we want
    return checkObjectExpression(
        asExpression.expression as TSESTree.ObjectExpression
    );
};

const rule = createRule<[], "shouldSpecifyForbidUnknownValues">({
    name: "should-specify-forbid-unknown-values",
    meta: {
        docs: {
            description:
                "ValidationPipe should use forbidUnknownValues: true to prevent attacks. See https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413",
        },
        messages: {
            shouldSpecifyForbidUnknownValues: `ValidationPipe should use forbidUnknownValues: true to prevent attacks if setting you're setting any options. See https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            NewExpression(node: TSESTree.NewExpression): void {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result = shouldTriggerNewExpressionHasProperty(node);

                if (result) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyForbidUnknownValues",
                    });
                }
            },

            VariableDeclarator(node: TSESTree.VariableDeclarator): void {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result =
                    shouldTriggerForVariableDeclaratorExpression(node);

                if (result) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyForbidUnknownValues",
                    });
                }
            },
        };
    },
});

export default rule;
