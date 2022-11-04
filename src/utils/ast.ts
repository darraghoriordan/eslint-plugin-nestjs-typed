import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/types";

export function getPropertiesDefinitions(
    classDeclaration: TSESTree.ClassDeclaration
): TSESTree.PropertyDefinition[] {
    return classDeclaration.body.body.filter(
        (element): element is TSESTree.PropertyDefinition =>
            element.type === AST_NODE_TYPES.PropertyDefinition
    );
}
