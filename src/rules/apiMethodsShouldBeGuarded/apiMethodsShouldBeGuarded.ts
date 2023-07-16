import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

export const apiMethodsShouldBeGuarded = (node: TSESTree.MethodDefinition) => {
    const hasApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["Get", "Post", "Put", "Delete", "Patch", "Options", "Head", "All"]
    );

    const hasUseGuardsDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
        node,
        ["UseGuards"]
    );

    function findClassDeclaration(
        node: TSESTree.Node
    ): TSESTree.ClassDeclaration | null {
        if (node.type === TSESTree.AST_NODE_TYPES.ClassDeclaration) {
            return node;
        }
        if (node.parent) {
            return findClassDeclaration(node.parent);
        }
        return null;
    }

    const classNode = findClassDeclaration(node);

    const hasUseGuardsDecoratorOnController = classNode
        ? typedTokenHelpers.nodeHasDecoratorsNamed(classNode, ["UseGuards"])
        : false;

    return (
        hasApiMethodDecorator &&
        !hasUseGuardsDecorator &&
        !hasUseGuardsDecoratorOnController
    );
};

const rule = createRule<[], "apiMethodsShouldBeGuarded">({
    name: "api-methods-should-be-guarded",
    meta: {
        docs: {
            description:
                "Endpoints should have authentication guards to maintain our security model.",

            requiresTypeChecking: false,
        },
        messages: {
            apiMethodsShouldBeGuarded:
                "All controller endpoints should have @UseGuards decorators, or one decorating the root of the Controller.",
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],
    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (apiMethodsShouldBeGuarded(node)) {
                    context.report({
                        node: node,
                        messageId: "apiMethodsShouldBeGuarded",
                    });
                }
            },
        };
    },
});

export default rule;
