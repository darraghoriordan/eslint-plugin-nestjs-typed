import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {
    decoratorArgumentsContainNamedConstruct,
    getUploadedFileDecorators,
    methodHasMulterFileSizeLimit,
    nodeHasAnyDecoratorNamed,
} from "../../utils/nestFileUpload.js";

export type UploadedFileShouldBeValidatedOptions = [
    {
        additionalFileValidationDecorators: string[];
        additionalFileValidationPipes: string[];
    },
];

const rule = createRule<
    UploadedFileShouldBeValidatedOptions,
    "missingFileValidation"
>({
    name: "uploaded-file-should-be-validated",
    meta: {
        docs: {
            description:
                "Requires uploaded files to be validated by a file pipe or constrained by a Multer file-size limit.",
        },
        messages: {
            missingFileValidation:
                "Validate this uploaded file with ParseFilePipe/ParseFilePipeBuilder, a configured custom validation pipe, or a Multer limits.fileSize option.",
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    additionalFileValidationDecorators: {
                        description:
                            "Custom method or controller decorators that establish file-upload validation.",
                        type: "array",
                        items: {type: "string", minLength: 1},
                        minItems: 0,
                    },
                    additionalFileValidationPipes: {
                        description:
                            "Custom pipe constructor names accepted as uploaded-file validation.",
                        type: "array",
                        items: {type: "string", minLength: 1},
                        minItems: 0,
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "problem",
    },
    defaultOptions: [
        {
            additionalFileValidationDecorators: [],
            additionalFileValidationPipes: [],
        },
    ],
    create(context) {
        const {
            additionalFileValidationDecorators,
            additionalFileValidationPipes,
        } = context.options[0] ?? {
            additionalFileValidationDecorators: [],
            additionalFileValidationPipes: [],
        };
        const acceptedPipeNames = new Set([
            "ParseFilePipe",
            "ParseFilePipeBuilder",
            ...additionalFileValidationPipes,
        ]);

        return {
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                const uploadDecorators = getUploadedFileDecorators(node);
                if (uploadDecorators.length === 0) {
                    return;
                }

                const containingClass = node.parent.parent;
                const hasCustomValidationDecorator =
                    nodeHasAnyDecoratorNamed(
                        node,
                        additionalFileValidationDecorators
                    ) ||
                    (containingClass.type === AST_NODE_TYPES.ClassDeclaration &&
                        nodeHasAnyDecoratorNamed(
                            containingClass,
                            additionalFileValidationDecorators
                        ));

                if (
                    hasCustomValidationDecorator ||
                    methodHasMulterFileSizeLimit(node)
                ) {
                    return;
                }

                for (const decorator of uploadDecorators) {
                    if (
                        !decoratorArgumentsContainNamedConstruct(
                            decorator,
                            acceptedPipeNames
                        )
                    ) {
                        context.report({
                            node: decorator,
                            messageId: "missingFileValidation",
                        });
                    }
                }
            },
        };
    },
});

export default rule;
