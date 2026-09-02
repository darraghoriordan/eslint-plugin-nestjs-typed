import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {getParameterDecorators} from "./decorators.js";
import {typedTokenHelpers} from "./typedTokenHelpers.js";

const fileUploadDecoratorNames = new Set(["UploadedFile", "UploadedFiles"]);
const fileInterceptorNames = new Set([
    "FileInterceptor",
    "FilesInterceptor",
    "FileFieldsInterceptor",
    "AnyFilesInterceptor",
]);

const isNode = (value: unknown): value is TSESTree.Node =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as {type?: unknown}).type === "string";

const walkNode = (
    node: TSESTree.Node,
    predicate: (candidate: TSESTree.Node) => boolean
): boolean => {
    if (predicate(node)) {
        return true;
    }

    for (const [key, value] of Object.entries(node)) {
        if (["parent", "loc", "range", "tokens", "comments"].includes(key)) {
            continue;
        }

        if (isNode(value) && walkNode(value, predicate)) {
            return true;
        }

        if (
            Array.isArray(value) &&
            value.some((item) => isNode(item) && walkNode(item, predicate))
        ) {
            return true;
        }
    }

    return false;
};

const getCallName = (
    node: TSESTree.CallExpression | TSESTree.NewExpression
): string | null => {
    if (node.callee.type === AST_NODE_TYPES.Identifier) {
        return node.callee.name;
    }

    if (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.property.type === AST_NODE_TYPES.Identifier
    ) {
        return node.callee.property.name;
    }

    return null;
};

const getPropertyName = (property: TSESTree.Property): string | null => {
    if (property.key.type === AST_NODE_TYPES.Identifier) {
        return property.key.name;
    }

    if (
        property.key.type === AST_NODE_TYPES.Literal &&
        typeof property.key.value === "string"
    ) {
        return property.key.value;
    }

    return null;
};

const objectHasFileSizeLimit = (node: TSESTree.Node): boolean =>
    walkNode(node, (candidate) => {
        if (candidate.type !== AST_NODE_TYPES.Property) {
            return false;
        }

        if (
            getPropertyName(candidate) !== "limits" ||
            candidate.value.type !== AST_NODE_TYPES.ObjectExpression
        ) {
            return false;
        }

        return candidate.value.properties.some(
            (property) =>
                property.type === AST_NODE_TYPES.Property &&
                getPropertyName(property) === "fileSize"
        );
    });

export const getUploadedFileDecorators = (
    method: TSESTree.MethodDefinition
): TSESTree.Decorator[] =>
    method.value.params.flatMap((parameter) =>
        getParameterDecorators(parameter).filter((decorator) => {
            const name = typedTokenHelpers.getDecoratorName(decorator);
            return name !== null && fileUploadDecoratorNames.has(name);
        })
    );

export const decoratorArgumentsContainNamedConstruct = (
    decorator: TSESTree.Decorator,
    names: Set<string>
): boolean => {
    if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) {
        return false;
    }

    return decorator.expression.arguments.some(
        (argument) =>
            argument.type !== AST_NODE_TYPES.SpreadElement &&
            walkNode(argument, (candidate) => {
                if (candidate.type === AST_NODE_TYPES.Identifier) {
                    return names.has(candidate.name);
                }

                if (
                    candidate.type !== AST_NODE_TYPES.CallExpression &&
                    candidate.type !== AST_NODE_TYPES.NewExpression
                ) {
                    return false;
                }

                const name = getCallName(candidate);
                return name !== null && names.has(name);
            })
    );
};

export const methodHasMulterFileSizeLimit = (
    method: TSESTree.MethodDefinition
): boolean => {
    const containingClass = method.parent.parent;
    const decorators = [
        ...method.decorators,
        ...(containingClass.type === AST_NODE_TYPES.ClassDeclaration ||
        containingClass.type === AST_NODE_TYPES.ClassExpression
            ? containingClass.decorators
            : []),
    ];

    return decorators.some((decorator) => {
        if (
            typedTokenHelpers.getDecoratorName(decorator) !==
                "UseInterceptors" ||
            decorator.expression.type !== AST_NODE_TYPES.CallExpression
        ) {
            return false;
        }

        return decorator.expression.arguments.some(
            (argument) =>
                argument.type !== AST_NODE_TYPES.SpreadElement &&
                walkNode(argument, (candidate) => {
                    if (candidate.type !== AST_NODE_TYPES.CallExpression) {
                        return false;
                    }

                    const callName = getCallName(candidate);
                    return (
                        callName !== null &&
                        fileInterceptorNames.has(callName) &&
                        candidate.arguments.some(
                            (callArgument) =>
                                callArgument.type !==
                                    AST_NODE_TYPES.SpreadElement &&
                                objectHasFileSizeLimit(callArgument)
                        )
                    );
                })
        );
    });
};

export const nodeHasAnyDecoratorNamed = (
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration,
    decoratorNames: string[]
): boolean =>
    decoratorNames.length > 0 &&
    typedTokenHelpers.nodeHasDecoratorsNamed(node, decoratorNames);
