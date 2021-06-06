import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/experimental-utils";
import {RuleContext} from "@typescript-eslint/experimental-utils/dist/ts-eslint";
import {parse} from "@typescript-eslint/parser";

export const typedTokenHelpers = {
    nodeHasDecoratorsNamed(
        n:
            | TSESTree.ClassDeclaration
            | TSESTree.ClassProperty
            | TSESTree.MethodDefinition,
        decoratorNames: string[]
    ): boolean {
        const decorators = this.getDecoratorsNamed(n, decoratorNames);

        return decorators.length > 0;
    },
    getDecoratorsNamed(
        n:
            | TSESTree.ClassDeclaration
            | TSESTree.ClassProperty
            | TSESTree.MethodDefinition,
        decoratorNames: string[]
    ): TSESTree.Decorator[] {
        const decorators = n.decorators?.filter((d) =>
            decoratorNames.includes(
                (
                    (d.expression as TSESTree.CallExpression)
                        .callee as TSESTree.Identifier
                ).name
            )
        );

        return decorators || [];
    },
    parseStringToAst(
        code: string,
        path: string,
        context: Readonly<RuleContext<never, never[]>>
    ): TSESTree.Program {
        return parse(code, {
            filePath: path,
            range: true,
            tokens: true,
            loc: true,
            ...context.parserOptions,
        });
    },
    isOptionalPropertyValue(node: TSESTree.ClassProperty): boolean {
        const isUndefinedType =
            (
                node.typeAnnotation?.typeAnnotation as TSESTree.TSUnionType
            )?.types?.find(
                (t) => t.type === AST_NODE_TYPES.TSUndefinedKeyword
            ) !== undefined;

        const isOptionalPropertyValue =
            node.optional || isUndefinedType || false;
        return isOptionalPropertyValue;
    },
};
