import {AST_NODE_TYPES, TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";

const importIsDecorator = (
    imp: TSESTree.ImportDeclaration,
    decoratorName: string
): boolean => {
    const isFromClassValidator = imp.source.value.startsWith("class-validator");
    const isDecoratorImport = imp.specifiers.some(
        (specifier) => specifier.local.name === decoratorName
    );

    return isFromClassValidator && isDecoratorImport;
};

const decoratorIsImportedFromClassValidator = (
    imports: TSESTree.ImportDeclaration[],
    decorator: TSESTree.Decorator
): boolean => {
    if (decorator.expression.type !== TSESTree.AST_NODE_TYPES.CallExpression) {
        return false;
    }

    if (
        decorator.expression.callee.type !== TSESTree.AST_NODE_TYPES.Identifier
    ) {
        return false;
    }

    const decoratorName = decorator.expression.callee.name;

    return imports.some((imp) => importIsDecorator(imp, decoratorName));
};

const decoratorIsClassValidatorDecorator = (
    program: TSESTree.Program | null,
    decorator: TSESTree.Decorator
): boolean => {
    if (!program) {
        return false;
    }

    const imports = program.body.filter(
        (node) => node.type === TSESTree.AST_NODE_TYPES.ImportDeclaration
    ) as TSESTree.ImportDeclaration[];

    return decoratorIsImportedFromClassValidator(imports, decorator);
};

const getRootProgram = (node: TSESTree.BaseNode): TSESTree.Program | null => {
    let root = node;

    while (root.parent) {
        if (root.parent.type === TSESTree.AST_NODE_TYPES.Program) {
            return root.parent;
        }

        root = root.parent;
    }

    return null;
};

const rule = createRule({
    name: "all-properties-are-whitelisted",
    meta: {
        docs: {
            description: "Enforce all properties are whitelisted",
            recommended: "error",
            requiresTypeChecking: false,
        },
        messages: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "missing-property-decorator":
                "Property has no class-validator decorator (use @Allow() if you don't need a validation)",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (
        context: Readonly<
            TSESLint.RuleContext<"missing-property-decorator", never[]>
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node) {
                const program = getRootProgram(node);
                const withDecorator: TSESTree.PropertyDefinition[] = [];
                const withoutDecorator: TSESTree.PropertyDefinition[] = [];
                for (const element of node.body.body) {
                    if (element.type !== AST_NODE_TYPES.PropertyDefinition) {
                        continue;
                    }
                    const hasDecorator = element.decorators?.some(
                        (decorator) =>
                            decorator.expression.type ===
                                AST_NODE_TYPES.CallExpression &&
                            decorator.expression.callee.type ===
                                AST_NODE_TYPES.Identifier &&
                            decoratorIsClassValidatorDecorator(
                                program,
                                decorator
                            )
                    );
                    if (hasDecorator) {
                        withDecorator.push(element);
                    } else {
                        withoutDecorator.push(element);
                    }
                }
                if (withDecorator.length > 0 && withoutDecorator.length > 0) {
                    for (const element of withoutDecorator) {
                        context.report({
                            node: element,
                            messageId: "missing-property-decorator",
                        });
                    }
                }
            },
        };
    },
});

export default rule;
