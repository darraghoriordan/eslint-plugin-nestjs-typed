import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";

// These are special NestJS tokens that cannot be used with app.get() or @Inject()
// because they are applied globally and don't work like regular providers
const FORBIDDEN_APP_TOKENS = new Set([
    "APP_GUARD",
    "APP_PIPE",
    "APP_FILTER",
    "APP_INTERCEPTOR",
]);

/**
 * Checks if a node is an identifier with one of the forbidden APP_* token names
 */
const isForbiddenAppToken = (node: TSESTree.Node | undefined): boolean => {
    if (!node) {
        return false;
    }

    if (node.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return FORBIDDEN_APP_TOKENS.has(node.name);
    }

    return false;
};

const rule = createRule<[], "useInjectableProvidedToken">({
    name: "use-injectable-provided-token",
    meta: {
        docs: {
            description:
                "Prevents using APP_GUARD, APP_PIPE, APP_FILTER, or APP_INTERCEPTOR tokens with app.get() or @Inject() as these are global providers that cannot be retrieved this way.",
        },
        messages: {
            useInjectableProvidedToken:
                "Cannot use {{tokenName}} with {{method}}. These tokens are for global providers and cannot be retrieved or injected directly. Use them only in module provider arrays.",
        },
        schema: [],
        hasSuggestions: false,
        type: "problem",
    },
    defaultOptions: [],
    create(context) {
        return {
            // Check for app.get(APP_*) calls
            CallExpression(node: TSESTree.CallExpression): void {
                // Check if this is a member expression like app.get()
                if (
                    node.callee.type ===
                    TSESTree.AST_NODE_TYPES.MemberExpression
                ) {
                    const memberExpression = node.callee;

                    // Check if the method is 'get'
                    if (
                        memberExpression.property.type ===
                            TSESTree.AST_NODE_TYPES.Identifier &&
                        memberExpression.property.name === "get"
                    ) {
                        // Check if the first argument is one of the forbidden tokens
                        const firstArgument = node.arguments[0];
                        if (isForbiddenAppToken(firstArgument)) {
                            context.report({
                                node: firstArgument,
                                messageId: "useInjectableProvidedToken",
                                data: {
                                    tokenName: (
                                        firstArgument as TSESTree.Identifier
                                    ).name,
                                    method: "app.get()",
                                },
                            });
                        }
                    }
                }
            },

            // Check for @Inject(APP_*) decorators
            Decorator(node: TSESTree.Decorator): void {
                // Check if this is an @Inject decorator
                if (
                    node.expression.type ===
                        TSESTree.AST_NODE_TYPES.CallExpression &&
                    node.expression.callee.type ===
                        TSESTree.AST_NODE_TYPES.Identifier &&
                    node.expression.callee.name === "Inject"
                ) {
                    // Check if the first argument is one of the forbidden tokens
                    const firstArgument = node.expression.arguments[0];
                    if (isForbiddenAppToken(firstArgument)) {
                        context.report({
                            node: firstArgument,
                            messageId: "useInjectableProvidedToken",
                            data: {
                                tokenName: (
                                    firstArgument as TSESTree.Identifier
                                ).name,
                                method: "@Inject()",
                            },
                        });
                    }
                }
            },
        };
    },
});

export default rule;
