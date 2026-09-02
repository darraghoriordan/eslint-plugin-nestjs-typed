import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";

export const getParameterDecorators = (
    parameter: TSESTree.Parameter
): TSESTree.Decorator[] => {
    if (parameter.type === AST_NODE_TYPES.TSParameterProperty) {
        return parameter.decorators;
    }

    return parameter.decorators ?? [];
};
