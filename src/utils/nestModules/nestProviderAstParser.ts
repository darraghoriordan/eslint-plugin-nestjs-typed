import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";

export const nestProviderAstParser = {
    mapNestProviderObject(
        n: TSESTree.Property,
        path: string
    ): Array<string | NestProvidedInjectablesMap> | null {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const propertyName = (n.value as TSESTree.Identifier).name;
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
        providerDeclaration: TSESTree.VariableDeclarator | undefined,
        propertyName: string
    ): TSESTree.Property | null {
        if (providerDeclaration) {
            const foundProviderProperty = (
                providerDeclaration.init as TSESTree.ObjectExpression
            ).properties.find(
                (p) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
