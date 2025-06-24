import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";

//import util from "util";
import {nestProviderAstParser} from "../../utils/nestModules/nestProviderAstParser.js";

const isNestProvider = (node: TSESTree.VariableDeclarator): boolean => {
    // should be a nest provider - note this doesn't check the Provider used is an import actually from nest. Assumes nest Provider. Will change if this is annoying:)
    // edit 03/06/2023 - it was annoying and someone complained on github so I added a check for a "useFactory" property on the Provider declaration
    const isNestProvider =
        (
            (node.id.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference)
                ?.typeName as TSESTree.Identifier
        )?.name === "Provider" &&
        // and there is a useFactory property in the declaration
        nestProviderAstParser.findProvideProperty(node, "useFactory");

    if (!isNestProvider) {
        return false;
    }
    return true;
};
const isNestProviderWithFactory = (
    node: TSESTree.ObjectExpression
): boolean => {
    // should be a nest provider - note this doesn't check the Provider used is an import actually from nest. Assumes nest Provider. Will change if this is annoying:)
    // edit 03/06/2023 - it was annoying and someone complained on github so I added a check for a "useFactory" property on the Provider declaration
    const isNestProvider =
        // and there is a useFactory property in the declaration
        nestProviderAstParser.findProvideProperty(node, "useFactory");

    if (!isNestProvider) {
        return false;
    }
    return true;
};

export const hasMismatchedInjected = (
    node: TSESTree.VariableDeclarator | TSESTree.ObjectExpression
): boolean => {
    // count number of factory params
    const factoryParameterCount = (
        nestProviderAstParser.findProvideProperty(node, "useFactory")
            ?.value as TSESTree.ArrowFunctionExpression
    ).params.length;

    // Count number of injected params
    const injectedParameter = nestProviderAstParser.findProvideProperty(
        node,
        "inject"
    )?.value as unknown as TSESTree.ArrayExpression;

    const injectedParameterCount = injectedParameter
        ? injectedParameter.elements.length
        : 0;

    // is there a mismatch?
    return injectedParameterCount !== factoryParameterCount;
};

const rule = createRule<[], "mainMessage">({
    name: "provided-injected-should-match-factory-parameters",
    meta: {
        docs: {
            description:
                "The injected items in a provider should typically match the parameters to the factory method used",
        },
        messages: {
            mainMessage: `The injected items don't match the factory method parameters, did you forget to add one?`,
        },
        schema: [],
        type: "problem",
    },
    defaultOptions: [],

    create(context) {
        return {
            "Decorator Property:has(Identifier[name=providers]) > ArrayExpression > ObjectExpression"(
                node: TSESTree.ObjectExpression
            ): void {
                if (
                    isNestProviderWithFactory(node) &&
                    hasMismatchedInjected(node)
                ) {
                    context.report({
                        node: node,
                        messageId: "mainMessage",
                    });
                }
            },
            VariableDeclarator(node: TSESTree.VariableDeclarator): void {
                if (isNestProvider(node) && hasMismatchedInjected(node)) {
                    context.report({
                        node: node,
                        messageId: "mainMessage",
                    });
                }
            },
        };
    },
});

export default rule;
