import {TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
// eslint-disable-next-line unicorn/import-style
//import util from "util";
import {nestProviderAstParser} from "../../utils/nestModules/nestProviderAstParser";

export const hasMismatchedInjected = (
    node: TSESTree.VariableDeclarator
): boolean => {
    // should be a nest provider - note this doesn't check the Provider used is an import actually from nest. Assumes nest Provider. Will change if this is annoying:)
    const isNestProvider =
        (
            (
            node.id.typeAnnotation
                ?.typeAnnotation as TSESTree.TSTypeReference
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )?.typeName as TSESTree.Identifier
        )?.name === "Provider";

    if (!isNestProvider) {
        return false;
    }

    // count number of factory params
    const factoryParameterCount = (
        nestProviderAstParser.findProvideProperty(node, "useFactory")
            ?.value as TSESTree.ArrowFunctionExpression
    ).params?.length;

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

const rule = createRule({
    name: "provided-injected-should-match-factory-parameters",
    meta: {
        docs: {
            description:
                "The injected items in a provider should typically match the parameters to the factory method used",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            mainMessage: `The injected items don't match the factory method parameters, did you forget to add one?`,
        },
        schema: [],
        type: "problem",
    },
    defaultOptions: [],

    create(context: Readonly<TSESLint.RuleContext<"mainMessage", never[]>>) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            VariableDeclarator(node: TSESTree.VariableDeclarator): void {
                if (hasMismatchedInjected(node)) {
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
