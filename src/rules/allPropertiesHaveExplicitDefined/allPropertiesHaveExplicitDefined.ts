import {
    AST_NODE_TYPES,
    TSESTree,
    ESLintUtils,
    ParserServicesWithTypeInformation,
} from "@typescript-eslint/utils";
import {isNullableType} from "@typescript-eslint/type-utils";
import {getPropertiesDefinitions} from "../../utils/ast.js";
import {createRule} from "../../utils/createRule.js";
import {Type, TypeChecker} from "typescript";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

type Options = [
    {
        additionalDecorators?: string[];
    },
];

const rule = createRule<
    Options,
    | "missing-is-defined-decorator"
    | "missing-is-optional-decorator"
    | "conflicting-defined-decorators-defined-optional"
    | "conflicting-defined-decorators-optional-validate-if"
    | "conflicting-defined-decorators-all"
>({
    name: "all-properties-have-explicit-defined",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit defined status decorator",
        },
        messages: {
            "missing-is-defined-decorator":
                "Non-optional properties must have a decorator that checks the value is defined (for example: @IsDefined())",
            "missing-is-optional-decorator":
                "Optional properties must have @IsOptional() or @ValidateIf() decorator",
            "conflicting-defined-decorators-defined-optional":
                "Properties can have @IsDefined() or @IsOptional() but not both",
            "conflicting-defined-decorators-optional-validate-if":
                "Properties can have @IsOptional() or @ValidateIf() but not both",
            "conflicting-defined-decorators-all":
                "Properties can have one of @IsDefined() or @IsOptional() or @ValidateIf()",
        },
        type: "problem",
        schema: [
            {
                type: "object",
                properties: {
                    additionalDecorators: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        description:
                            "List of custom decorator names that should be treated as class-validator decorators",
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            additionalDecorators: [],
        },
    ],
    create: function (context) {
        const service = ESLintUtils.getParserServices(context);
        const {additionalDecorators = []} = context.options[0] || {};

        const checker = service.program.getTypeChecker();
        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration) {
                const propertyDefinitionsWithDecoratorsStatus: [
                    TSESTree.PropertyDefinition,
                    DecoratorsStatus,
                ][] = [];
                let withDecoratorCount = 0;
                const propertyDefinitions = getPropertiesDefinitions(node);
                // for each property in the class
                for (const propertyDefinition of propertyDefinitions) {
                    // check for the optional or defined decorators, or any class-validator decorator
                    const decoratorsStatus = getDecoratorsStatus(
                        propertyDefinition,
                        additionalDecorators
                    );
                    propertyDefinitionsWithDecoratorsStatus.push([
                        propertyDefinition,
                        decoratorsStatus,
                    ]);

                    // It doesn't make sense to have all three decorators on the same property
                    if (
                        decoratorsStatus.hasIsDefinedDecorator &&
                        decoratorsStatus.hasIsOptionalDecorator &&
                        decoratorsStatus.hasValidateIfDecorator
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId: "conflicting-defined-decorators-all",
                        });
                    } else if (
                        decoratorsStatus.hasIsDefinedDecorator &&
                        decoratorsStatus.hasIsOptionalDecorator
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId:
                                "conflicting-defined-decorators-defined-optional",
                        });
                    } else if (
                        decoratorsStatus.hasIsOptionalDecorator &&
                        decoratorsStatus.hasValidateIfDecorator
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId:
                                "conflicting-defined-decorators-optional-validate-if",
                        });
                    } else if (
                        decoratorsStatus.hasIsDefinedDecorator ||
                        decoratorsStatus.hasTypeCheckingDecorator ||
                        decoratorsStatus.hasIsOptionalDecorator ||
                        decoratorsStatus.hasValidateIfDecorator
                    ) {
                        withDecoratorCount++;
                    }
                }
                if (withDecoratorCount > 0) {
                    for (const [
                        propertyDefinition,
                        decoratorsStatus,
                    ] of propertyDefinitionsWithDecoratorsStatus) {
                        // if there's no type available we can't check if it's optional
                        if (!propertyDefinition.typeAnnotation) {
                            continue;
                        }
                        // get the type of the property
                        const type = getType(
                            propertyDefinition.typeAnnotation.typeAnnotation,
                            service,
                            checker
                        );

                        // if the type is nullable, it should be optional
                        if (
                            propertyDefinition.optional ||
                            isNullableType(type)
                        ) {
                            if (
                                !decoratorsStatus.hasIsOptionalDecorator &&
                                !decoratorsStatus.hasValidateIfDecorator
                            ) {
                                context.report({
                                    node: propertyDefinition,
                                    messageId: "missing-is-optional-decorator",
                                });
                            }
                        } else {
                            if (
                                !decoratorsStatus.hasIsDefinedDecorator &&
                                !decoratorsStatus.hasTypeCheckingDecorator
                            ) {
                                context.report({
                                    node: propertyDefinition,
                                    messageId: "missing-is-defined-decorator",
                                });
                            }
                        }
                    }
                }
            },
        };
    },
});

export default rule;

interface DecoratorsStatus {
    hasIsDefinedDecorator: boolean;
    hasTypeCheckingDecorator: boolean;
    hasIsOptionalDecorator: boolean;
    hasValidateIfDecorator: boolean;
}

function getType(
    typeNode: TSESTree.Node,
    service: ParserServicesWithTypeInformation,
    checker: TypeChecker
): Type {
    const tsNode = service.esTreeNodeToTSNodeMap.get(typeNode);
    const type = checker.getTypeAtLocation(tsNode);
    return type;
}

function getDecoratorsStatus(
    propertyDefinition: TSESTree.PropertyDefinition,
    additionalDecorators: string[] = []
): DecoratorsStatus {
    let hasIsDefinedDecorator = false;
    let hasTypeCheckingDecorator = false;
    let hasIsOptionalDecorator = false;
    let hasValidateIfDecorator = false;

    const validationDecorators = typedTokenHelpers.getValidationDecorators(
        propertyDefinition,
        additionalDecorators
    );

    for (const decorator of validationDecorators) {
        if (
            decorator.expression.type === AST_NODE_TYPES.CallExpression &&
            decorator.expression.callee.type === AST_NODE_TYPES.Identifier
        ) {
            const decoratorName = decorator.expression.callee.name;

            // We care if the decorator is a validation decorator like IsString etc for checks later
            if (
                decoratorName !== "IsDefined" &&
                decoratorName !== "IsOptional" &&
                decoratorName !== "ValidateIf"
            ) {
                hasTypeCheckingDecorator = true;
            }
            // otherwise check if it is isDefined or isOptional, we will use this later
            if (decoratorName === "IsDefined") {
                hasIsDefinedDecorator = true;
            }

            if (decoratorName === "IsOptional") {
                hasIsOptionalDecorator = true;
            }
            if (decoratorName === "ValidateIf") {
                hasValidateIfDecorator = true;
            }
        }
    }
    return {
        hasIsDefinedDecorator,
        hasTypeCheckingDecorator,
        hasIsOptionalDecorator,
        hasValidateIfDecorator,
    };
}
