import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

export const shouldUseApiResponseDecorator = (
    node: TSESTree.MethodDefinition
): boolean => {
    const hasApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["Get", "Post", "Put", "Delete", "Patch", "Options", "Head", "All"]
    );

    const hasApiOperationDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["ApiOperation"]
    );

    return hasApiMethodDecorator && !hasApiOperationDecorator;
};

const rule = createRule<[], "shouldSpecifyApiOperation">({
    name: "api-method-should-specify-api-operation",
    meta: {
        docs: {
            description:
                "Api methods should at least specify the expected ApiOperation.",
        },
        messages: {
            shouldSpecifyApiOperation: `A method decorated with @Get, @Post etc. should specify the expected ApiOperation e.g. @ApiOperation({description: ""}). These decorators are in the @nestjs/swagger npm package.`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (shouldUseApiResponseDecorator(node)) {
                    context.report({
                        node: node,
                        messageId: "shouldSpecifyApiOperation",
                    });
                }
            },
        };
    },
});

export default rule;
