import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {
    getUploadedFileDecorators,
    nodeHasAnyDecoratorNamed,
} from "../../utils/nestFileUpload.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

export type SwaggerFileUploadShouldBeDocumentedOptions = [
    {
        additionalSwaggerDecorators: string[];
    },
];

const httpMethodDecoratorNames = [
    "Get",
    "Post",
    "Put",
    "Delete",
    "Patch",
    "Options",
    "Head",
    "All",
];

const hasMultipartConsumesDecorator = (
    node: TSESTree.MethodDefinition | TSESTree.ClassDeclaration
): boolean =>
    typedTokenHelpers
        .getDecoratorsNamed(node, ["ApiConsumes"])
        .some((decorator) => {
            if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) {
                return false;
            }

            return decorator.expression.arguments.some(
                (argument) =>
                    argument.type === AST_NODE_TYPES.Literal &&
                    argument.value === "multipart/form-data"
            );
        });

const rule = createRule<
    SwaggerFileUploadShouldBeDocumentedOptions,
    "missingApiBody" | "missingApiConsumes"
>({
    name: "swagger-file-upload-should-be-documented",
    meta: {
        docs: {
            description:
                "Requires Swagger file-upload endpoints to declare multipart consumption and an API body schema.",
        },
        messages: {
            missingApiConsumes:
                "File-upload endpoints should use @ApiConsumes('multipart/form-data') so the generated OpenAPI operation declares the correct content type.",
            missingApiBody:
                "File-upload endpoints should use @ApiBody() with a binary file schema so the uploaded file is represented in OpenAPI.",
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    additionalSwaggerDecorators: {
                        description:
                            "Custom method or controller decorators that provide both multipart consumption and the upload body schema.",
                        type: "array",
                        items: {type: "string", minLength: 1},
                        minItems: 0,
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [{additionalSwaggerDecorators: []}],
    create(context) {
        const {additionalSwaggerDecorators} = context.options[0] ?? {
            additionalSwaggerDecorators: [],
        };

        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (
                    getUploadedFileDecorators(node).length === 0 ||
                    !typedTokenHelpers.nodeHasDecoratorsNamed(
                        node,
                        httpMethodDecoratorNames
                    )
                ) {
                    return;
                }

                const containingClass = node.parent.parent;
                if (containingClass.type !== AST_NODE_TYPES.ClassDeclaration) {
                    return;
                }

                if (
                    typedTokenHelpers.nodeHasDecoratorsNamed(containingClass, [
                        "ApiExcludeController",
                    ]) ||
                    typedTokenHelpers.nodeHasDecoratorsNamed(node, [
                        "ApiExcludeEndpoint",
                    ]) ||
                    nodeHasAnyDecoratorNamed(
                        node,
                        additionalSwaggerDecorators
                    ) ||
                    nodeHasAnyDecoratorNamed(
                        containingClass,
                        additionalSwaggerDecorators
                    )
                ) {
                    return;
                }

                if (
                    !hasMultipartConsumesDecorator(node) &&
                    !hasMultipartConsumesDecorator(containingClass)
                ) {
                    context.report({
                        node,
                        messageId: "missingApiConsumes",
                    });
                }

                if (
                    !typedTokenHelpers.nodeHasDecoratorsNamed(node, ["ApiBody"])
                ) {
                    context.report({node, messageId: "missingApiBody"});
                }
            },
        };
    },
});

export default rule;
