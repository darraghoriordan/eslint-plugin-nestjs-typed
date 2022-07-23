import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";

export const nestModuleAstParser = {
    findNestModuleClass(
        ast: TSESTree.Program
    ): TSESTree.ClassDeclaration | null {
        for (const n of ast.body) {
            // find class declaration even if it's inside an export
            if (
                n.type === AST_NODE_TYPES.ClassDeclaration &&
                n.decorators &&
                n.decorators.length > 0
            ) {
                return n;
            }

            if (
                (n.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    n.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
                n.declaration?.type === AST_NODE_TYPES.ClassDeclaration
            ) {
                return n.declaration;
            }
        }
        return null;
    },

    mapNestModuleDecorator(
        n: TSESTree.ClassDeclaration,
        path: string
    ): Array<string | NestProvidedInjectablesMap> | null {
        // The nest module decorator is called "Module"
        const moduleDecorator = n.decorators?.find(
            (d) =>
                (
                    (d.expression as TSESTree.CallExpression)
                        .callee as TSESTree.Identifier
                )?.name === "Module"
        );
        if (moduleDecorator) {
            const mappedControllerElements =
                this.mapModuleDecoratorOptionProperty(
                    moduleDecorator,
                    "controllers"
                );
            const mappedProviderElements =
                this.mapModuleDecoratorOptionProperty(
                    moduleDecorator,
                    "providers"
                );

            const nestModuleMap = [
                path,
                new NestProvidedInjectablesMap(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    mappedControllerElements,
                    mappedProviderElements
                ),
            ];
            return nestModuleMap;
        }

        return null;
    },
    mapModuleDecoratorOptionProperty(
        moduleDecorator: TSESTree.Decorator,
        propertyName: string
    ): Set<string> {
        const optionProperty = (
            (moduleDecorator.expression as unknown as TSESTree.CallExpression)
                .arguments[0] as unknown as TSESTree.ObjectExpression
        ).properties.find(
            (p) =>
                ((p as TSESTree.Property).key as TSESTree.Identifier).name ===
                propertyName
        );

        if (optionProperty) {
            // a property can be an array expression e.g. myProp = []
            // or a variable e.g. myProp = someArray
            // - this only supports array expressions for now!

            const propertyAsArrayExpressionElements =
                (
                    (optionProperty as unknown as TSESTree.Property)
                        .value as TSESTree.ArrayExpression
                )?.elements || [];

            return new Set(
                propertyAsArrayExpressionElements.map(
                    (element) => (element as TSESTree.Identifier).name
                )
            );
        }

        return new Set();
    },
};
