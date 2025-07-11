import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {
    NestProvidedInjectablesMap,
    NestProvidedFilePath,
} from "./models/NestProvidedInjectablesMap.js";

function isObjectExpression(
    node: TSESTree.Node
): node is TSESTree.ObjectExpression {
    return node.type === AST_NODE_TYPES.ObjectExpression;
}

export const nestProviderAstParser = {
    mapNestProviderObject(
        n: TSESTree.Property,
        path: NestProvidedFilePath
    ): [NestProvidedFilePath, NestProvidedInjectablesMap] | null {
        const propertyName = (n.value as TSESTree.Identifier)?.name;
        if (propertyName) {
            return [
                path,
                new NestProvidedInjectablesMap(
                    new Set(),
                    new Set([propertyName])
                ),
            ];
        }
        return null;
    },
    findProvideProperty(
        providerDeclaration:
            | TSESTree.VariableDeclarator
            | TSESTree.ObjectExpression
            | undefined,
        propertyName: string
    ): TSESTree.Property | null {
        if (providerDeclaration) {
            const properties = isObjectExpression(providerDeclaration)
                ? providerDeclaration
                : providerDeclaration.init;
            // Type guard with isObjectExpression
            if (properties === null || !isObjectExpression(properties)) {
                console.log("null properties", properties);
                return null;
            }
            const foundProviderProperty = properties.properties.find(
                (p) =>
                    ((p as TSESTree.Property).key as TSESTree.Identifier)
                        .name === propertyName
            ) as TSESTree.Property;

            return foundProviderProperty;
        }
        return null;
    },
    findNestProviderVariableDeclaration(
        ast: TSESTree.Program
    ): TSESTree.VariableDeclarator | undefined {
        for (const n of ast.body) {
            if (
                (n.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    n.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
                n.declaration?.type === AST_NODE_TYPES.VariableDeclaration
            ) {
                const providerDeclaration = n.declaration.declarations.find(
                    (d) => {
                        const isObjectExpression =
                            (d.type === AST_NODE_TYPES.VariableDeclarator &&
                                // has property "provide" and that property is an identifier
                                d.init?.type ===
                                    AST_NODE_TYPES.ObjectExpression) ||
                            false;

                        const hasProvideProperty: boolean =
                            isObjectExpression &&
                            (
                                d.init as TSESTree.ObjectExpression
                            ).properties.some((property) => {
                                return (
                                    (property.type ===
                                        AST_NODE_TYPES.Property &&
                                        property.key.type ===
                                            AST_NODE_TYPES.Identifier &&
                                        property.key.name === "provide" &&
                                        property.value.type ===
                                            AST_NODE_TYPES.Identifier) ||
                                    false
                                );
                            });
                        return hasProvideProperty;
                    }
                );

                return providerDeclaration;
            }
        }
        return undefined;
    },
};
