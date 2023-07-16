import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

export const shouldUseApiTagDecorator = (
    node: TSESTree.ClassDeclaration
): boolean => {
    const hasControllerDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["Controller"]
    );

    const hasApiTagDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(node, [
        "ApiTags",
    ]);

    return hasControllerDecorator && !hasApiTagDecorator;
};

const rule = createRule<[], "shouldUseApiTagDecorator">({
    name: "controllers-should-supply-api-tags",
    meta: {
        docs: {
            description:
                "Controllers should supply an ApiTag to make swagger UI easier to navigate",

            requiresTypeChecking: false,
        },
        messages: {
            shouldUseApiTagDecorator: `Controllers should use @ApiTags decorator. This makes it much easier to navigate swagger UI. This ApiTags decorator is in the @nestjs/swagger package on npm.`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                if (shouldUseApiTagDecorator(node)) {
                    context.report({
                        node: node,
                        messageId: "shouldUseApiTagDecorator",
                    });
                }
            },
        };
    },
});

export default rule;
