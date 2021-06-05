import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/experimental-utils";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";

export const nestProviderAstParser = {
    mapNestProviderObject(
        n: TSESTree.Property,
        path: string
    ): NestProvidedInjectablesMap | null {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const propertyName = (n.value as TSESTree.Identifier).name;
        if (propertyName) {
            return new NestProvidedInjectablesMap(
                path,
                new Set(),
                new Set([propertyName])
            );
        }
        return null;
    },
    findNestProviderObjectsProperty(
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
    findNestProviderObject(
        ast: TSESTree.Program
    ): TSESTree.VariableDeclarator | undefined {
        for (const n of ast.body) {
            if (
                (n.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    n.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
                n.declaration?.type === AST_NODE_TYPES.VariableDeclaration
            ) {
                const providerDeclaration = n.declaration.declarations.find(
                    (d) =>
                        d.type === AST_NODE_TYPES.VariableDeclarator &&
                        (
                            (
                                d.id.typeAnnotation
                                    ?.typeAnnotation as TSESTree.TSTypeReference
                        // prettier-ignore
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            )?.typeName as TSESTree.Identifier
                        )?.name === "Provider"
                );
                return providerDeclaration;
            }
        }
        return undefined;
    },
};
