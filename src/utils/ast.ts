import {
    AST_NODE_TYPES,
    ClassDeclaration,
    PropertyDefinition,
} from "@typescript-eslint/types/dist/ast-spec";

export function getPropertiesDefinitions(
    classDeclaration: ClassDeclaration
): PropertyDefinition[] {
    return classDeclaration.body.body.filter(
        (element): element is PropertyDefinition =>
            element.type === AST_NODE_TYPES.PropertyDefinition
    );
}
