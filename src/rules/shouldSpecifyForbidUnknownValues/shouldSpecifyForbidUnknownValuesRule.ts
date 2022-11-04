import {VariableDeclarator} from "@babel/types";
import {TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";

export const isValidationPipeNewExpression = (node: TSESTree.Node): boolean => {
    const newExpression = node as TSESTree.NewExpression;
    const callee = newExpression?.callee as TSESTree.Identifier;
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
    const forbidUnknownValuesProperty = os?.properties?.find(
        (p) =>
            ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
            "forbidUnknownValues"
    ) as TSESTree.Property;
    // property is not present. this is wrong.
    if (os && !forbidUnknownValuesProperty) {
        return true;
    }
    // property is explicitly false. this is wrong.
    const isPropertyValueExplicitlyFalse =
        (forbidUnknownValuesProperty?.value as TSESTree.Literal).raw ===
        "false";
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
    if (
        newExpression.arguments?.length === 0 ||
        newExpression.arguments[0].type !== "ObjectExpression"
    ) {
        return false;
    }
    const argument = newExpression?.arguments[0];

    return checkObjectExpression(argument);
};

export const shouldTriggerForVariableDecleratorExpression = (
    node: TSESTree.Node
): boolean => {
    // if the developer hasn't annotated the object we can't continue to check these rules correctly (we don't know if anonymous objects need to have any props)
    const variableDeclarator = node as VariableDeclarator;
    const asExpression = variableDeclarator?.init as TSESTree.TSAsExpression;
    const typeAnnotation =
        asExpression?.typeAnnotation as TSESTree.TSTypeReference;
    const typeName = typeAnnotation?.typeName as TSESTree.Identifier;
    if (typeName === undefined || typeName.name !== "ValidationPipeOptions") {
        return false;
    }
    // otherwise check the object expression is what we want
    return checkObjectExpression(
        asExpression.expression as TSESTree.ObjectExpression
    );
};

const rule = createRule({
    name: "validation-pipe-should-use-forbid-unknown",
    meta: {
        docs: {
            description:
                "ValidationPipe should use forbidUnknownValues: true to prevent attacks. See https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldSpecifyForbidUnknownValues: `ValidationPipe should use forbidUnknownValues: true to prevent attacks if setting you're setting any options. See https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(
        context: Readonly<
            TSESLint.RuleContext<"shouldSpecifyForbidUnknownValues", never[]>
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            NewExpression(node: TSESTree.Node): void {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result = shouldTriggerNewExpressionHasProperty(node);

                if (result) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyForbidUnknownValues",
                    });
                }
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            VariableDeclarator(node: TSESTree.Node): void {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result =
                    shouldTriggerForVariableDecleratorExpression(node);

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
