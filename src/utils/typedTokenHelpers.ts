import {AST_NODE_TYPES, TSESLint, TSESTree} from "@typescript-eslint/utils";
import {parse, ParserServices} from "@typescript-eslint/parser";
import ts from "typescript";
import * as tsutils from "tsutils";
import {unionTypeParts} from "tsutils";

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
        const decorators = n.decorators?.filter((d) => {
            const factoryMethodDecoratorIdentifier = (
                (d.expression as TSESTree.CallExpression)
                    .callee as TSESTree.Identifier
            )?.name;
            const decoratorIdentifier = (d.expression as TSESTree.Identifier)
                ?.name;

            return decoratorNames.includes(
                factoryMethodDecoratorIdentifier ?? decoratorIdentifier ?? ""
            );
        });

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
    /**
     * Checks if an import is an import of the given decorator name
     * @param imp
     * @param decoratorName
     */
    importIsDecorator(
        imp: TSESTree.ImportDeclaration,
        decoratorName: string
    ): boolean {
        const isFromClassValidator =
            imp.source.value.startsWith("class-validator");
        const isDecoratorImport = imp.specifiers.some(
            (specifier) => specifier.local.name === decoratorName
        );

        return isFromClassValidator && isDecoratorImport;
    },
    /**
     * Checks if decorator is in imports of a node
     * @param imports
     * @param decorator
     */
    decoratorIsImportedFromClassValidator(
        imports: TSESTree.ImportDeclaration[],
        decorator: TSESTree.Decorator
    ): boolean {
        const decoratorName = this.getDecoratorName(decorator);

        if (!decoratorName) {
            return false;
        }

        return imports.some((imp) =>
            typedTokenHelpers.importIsDecorator(imp, decoratorName)
        );
    },
    /**
     * Checks whether a decorator is a class validator decorator
     * @param program The root program node
     * @param decorator The decorator node
     */
    decoratorIsClassValidatorDecorator(
        program: TSESTree.Program | null,
        decorator: TSESTree.Decorator
    ): boolean {
        if (!program) {
            return false;
        }

        const imports = program.body.filter(
            (node): node is TSESTree.ImportDeclaration =>
                node.type === TSESTree.AST_NODE_TYPES.ImportDeclaration
        );

        return typedTokenHelpers.decoratorIsImportedFromClassValidator(
            imports,
            decorator
        );
    },
    /**
     * Gets the root program of a node
     * @param node
     */
    getRootProgram(node: TSESTree.BaseNode): TSESTree.Program | null {
        let root = node;

        while (root.parent) {
            if (root.parent.type === TSESTree.AST_NODE_TYPES.Program) {
                return root.parent;
            }

            root = root.parent;
        }

        return null;
    },
    /**
     * Gets all the decorators actually imported from class-validator lib or decorators that were included in the additionalCustomValidatorDecorators options
     * @param node PropertyDefinition node
     */
    getValidationDecorators(
        node: TSESTree.PropertyDefinition,
        additionalCustomValidatorDecorators: string[] = []
    ): TSESTree.Decorator[] {
        const program = typedTokenHelpers.getRootProgram(node);

        const {decorators} = node;

        return (
            decorators?.filter((decorator): decorator is TSESTree.Decorator => {
                const isClassValidatorDecorator =
                    typedTokenHelpers.decoratorIsClassValidatorDecorator(
                        program,
                        decorator
                    );

                const decoratorName =
                    typedTokenHelpers.getDecoratorName(decorator);

                const isCustomClassValidatorDecorator =
                    decoratorName !== null
                        ? additionalCustomValidatorDecorators.includes(
                              decoratorName
                          )
                        : false;

                return (
                    isCustomClassValidatorDecorator || isClassValidatorDecorator
                );
            }) ?? []
        );
    },
    /**
     * Checks if the decorator is the IsEnum decorator
     * @param decorator
     */
    decoratorIsIsEnum(decorator: TSESTree.Decorator): boolean {
        const decoratorName = this.getDecoratorName(decorator);

        return decoratorName === "IsEnum";
    },
    /** Checks if the decorator is the IsObject decorator
     * @param decorator
     */
    decoratorIsIsObject(decorator: TSESTree.Decorator): boolean {
        const decoratorName = this.getDecoratorName(decorator);

        return decoratorName === "IsObject";
    },
    /**
     * Gets the name of a decorator
     * Returns null if no name is found
     * @param decorator
     */
    getDecoratorName(decorator: TSESTree.Decorator): string | null {
        if (
            decorator.expression.type !== TSESTree.AST_NODE_TYPES.CallExpression
        ) {
            return null;
        }

        if (
            decorator.expression.callee.type !==
            TSESTree.AST_NODE_TYPES.Identifier
        ) {
            return null;
        }

        return decorator.expression.callee.name;
    },
};
