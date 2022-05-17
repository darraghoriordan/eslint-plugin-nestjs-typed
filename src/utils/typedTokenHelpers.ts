import {AST_NODE_TYPES, TSESTree, TSESLint} from "@typescript-eslint/utils";
import {parse, ParserServices} from "@typescript-eslint/parser";
import ts from "typescript";
import {unionTypeParts} from "tsutils";
import * as tsutils from "tsutils";
export const typedTokenHelpers = {
    decoratorsThatCouldMeanTheDevIsValidatingAnArray: [
        "IsArray",
        "ArrayMinSize",
        "ArrayMinSize",
        "ArrayContains",
        "ArrayNotContains",
        "ArrayNotEmpty",
        "ArrayUnique",
    ],
    isTypeArrayTypeOrUnionOfArrayTypes(
        node: TSESTree.Node,
        parserService: ParserServices,
        checker: ts.TypeChecker
    ): boolean {
        if (
            (node as TSESTree.PropertyDefinition)?.typeAnnotation
                ?.typeAnnotation?.type === TSESTree.AST_NODE_TYPES.TSArrayType
        ) {
            return true;
        }

        const nodeType = this.getNodeType(node, parserService, checker);
        if (checker.isArrayType(nodeType)) {
            return true;
        }
        for (const t of unionTypeParts(nodeType)) {
            if (!checker.isArrayType(t)) {
                return false;
            }
        }

        return true;
    },
    getNodeType(
        node: TSESTree.Node,
        parserService: ParserServices,
        checker: ts.TypeChecker
    ): ts.Type {
        const tsNode = parserService.esTreeNodeToTSNodeMap.get(node);
        return typedTokenHelpers.getConstrainedTypeAtLocation(checker, tsNode);
    },
    expressionNodeIsArrayType(
        node: TSESTree.Expression,
        parserService: ParserServices,
        checker: ts.TypeChecker
    ): boolean {
        const nodeType = this.getNodeType(node, parserService, checker);
        return checker.isArrayType(nodeType);
    },
    getPropertyValueEqualsExpected(
        firstArgument: TSESTree.ObjectExpression,
        propertyName: string,
        expectedValue: string | number | bigint | boolean | RegExp | null
    ): boolean {
        let didMatchExpectedValues = false;
        if (firstArgument !== undefined) {
            const foundPropertyOfName = firstArgument.properties.find(
                (p) =>
                    ((p as TSESTree.Property).key as TSESTree.Identifier)
                        .name === propertyName
            );

            didMatchExpectedValues =
                foundPropertyOfName !== undefined &&
                (
                    (foundPropertyOfName as TSESTree.Property)
                        .value as TSESTree.Literal
                ).value === expectedValue;
        }
        return didMatchExpectedValues;
    },
    getConstrainedTypeAtLocation(
        checker: ts.TypeChecker,
        node: ts.Node
    ): ts.Type {
        const nodeType = checker.getTypeAtLocation(node);
        const constrained = checker.getBaseConstraintOfType(nodeType);

        return constrained ?? nodeType;
    },
    nodeHasDecoratorsNamed(
        n:
            | TSESTree.ClassDeclaration
            | TSESTree.PropertyDefinition
            | TSESTree.MethodDefinition,
        decoratorNames: string[]
    ): boolean {
        const decorators = this.getDecoratorsNamed(n, decoratorNames);

        return decorators.length > 0;
    },
    getDecoratorsNamed(
        n:
            | TSESTree.ClassDeclaration
            | TSESTree.PropertyDefinition
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
        context: Readonly<TSESLint.RuleContext<never, never[]>>
    ): TSESTree.Program {
        return parse(code, {
            filePath: path,
            range: true,
            tokens: true,
            loc: true,
            ...context.parserOptions,
        });
    },
    isEnumType(type: ts.Type) {
        // if for some reason this returns true...
        if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Enum)) return true;
        if (tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike)) return true;

        // it's not an enum type if it's an enum literal type
        if (
            tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLiteral) &&
            !type.isUnion()
        )
            return false;

        // get the symbol and check if its value declaration is an enum declaration
        const symbol = type.getSymbol();
        if (symbol == null) return false;

        const {valueDeclaration} = symbol;
        return (
            valueDeclaration != null &&
            valueDeclaration.kind === ts.SyntaxKind.EnumDeclaration
        );
    },
    isOptionalPropertyValue(node: TSESTree.PropertyDefinition): boolean {
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
