import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import ts from "typescript";
import {createRule} from "../../utils/createRule.js";
import {getParameterDecorators} from "../../utils/decorators.js";

const getForwardRefTargetName = (
    decorator: TSESTree.Decorator
): string | null => {
    if (
        decorator.expression.type !== AST_NODE_TYPES.CallExpression ||
        decorator.expression.callee.type !== AST_NODE_TYPES.Identifier ||
        decorator.expression.callee.name !== "Inject"
    ) {
        return null;
    }

    const forwardRefCall = decorator.expression.arguments[0];
    if (
        forwardRefCall?.type !== AST_NODE_TYPES.CallExpression ||
        forwardRefCall.callee.type !== AST_NODE_TYPES.Identifier ||
        forwardRefCall.callee.name !== "forwardRef"
    ) {
        return null;
    }

    const callback = forwardRefCall.arguments[0];
    if (
        callback?.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
        callback.body.type !== AST_NODE_TYPES.Identifier
    ) {
        return null;
    }

    return callback.body.name;
};

const getDirectTypeReference = (
    parameter: TSESTree.Parameter
): {name: string; node: TSESTree.TypeNode} | null => {
    const innerParameter =
        parameter.type === AST_NODE_TYPES.TSParameterProperty
            ? parameter.parameter
            : parameter;

    if (innerParameter.type !== AST_NODE_TYPES.Identifier) {
        return null;
    }

    const typeNode = innerParameter.typeAnnotation?.typeAnnotation;
    if (
        typeNode?.type !== AST_NODE_TYPES.TSTypeReference ||
        typeNode.typeName.type !== AST_NODE_TYPES.Identifier
    ) {
        return null;
    }

    return {name: typeNode.typeName.name, node: typeNode};
};

const rule = createRule<[], "useWrapperType">({
    name: "forward-ref-injection-should-use-wrapper-type",
    meta: {
        docs: {
            description:
                "Requires forwardRef constructor injections to avoid a direct runtime type reference that can fail with ESM decorator metadata.",
        },
        messages: {
            useWrapperType:
                "The type '{{typeName}}' is also referenced by forwardRef(). Wrap the parameter type (for example WrapperType<{{typeName}}>) or refactor the circular dependency to prevent an ESM initialization error.",
        },
        schema: [],
        hasSuggestions: false,
        type: "problem",
    },
    defaultOptions: [],
    create(context) {
        const program = context.sourceCode.parserServices?.program;
        const compilerOptions = program?.getCompilerOptions();
        const sourceFile = program?.getSourceFile(context.filename);
        const isEsmDecoratorMetadataProject =
            compilerOptions?.emitDecoratorMetadata === true &&
            compilerOptions.module !== undefined &&
            compilerOptions.module !== ts.ModuleKind.CommonJS &&
            sourceFile?.impliedNodeFormat !== ts.ModuleKind.CommonJS;

        if (!isEsmDecoratorMetadataProject) {
            return {};
        }

        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (node.kind !== "constructor") {
                    return;
                }

                for (const parameter of node.value.params) {
                    const directType = getDirectTypeReference(parameter);
                    if (!directType) {
                        continue;
                    }

                    const matchingDecorator = getParameterDecorators(
                        parameter
                    ).find(
                        (decorator) =>
                            getForwardRefTargetName(decorator) ===
                            directType.name
                    );

                    if (matchingDecorator) {
                        context.report({
                            node: directType.node,
                            messageId: "useWrapperType",
                            data: {typeName: directType.name},
                        });
                    }
                }
            },
        };
    },
});

export default rule;
