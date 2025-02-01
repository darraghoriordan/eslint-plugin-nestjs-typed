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

const rule = createRule<
    [],
    | "missing-is-defined-decorator"
    | "missing-is-optional-decorator"
    | "conflicting-defined-decorators-defined-optional"
    | "conflicting-defined-decorators-defined-validate-if"
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
            "conflicting-defined-decorators-defined-validate-if":
                "Properties can have @IsDefined() or @ValidateIf() but not both",
            "conflicting-defined-decorators-optional-validate-if":
                "Properties can have @IsOptional() or @ValidateIf() but not both",
            "conflicting-defined-decorators-all":
                "Properties can have one of @IsDefined() or @IsOptional() or @ValidateIf()",
        },
        type: "problem",
        schema: [],
    },
    defaultOptions: [],
    create: function (context) {
        const service = ESLintUtils.getParserServices(context);

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
                    const decoratorsStatus =
                        getDecoratorsStatus(propertyDefinition);
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
                        decoratorsStatus.hasIsDefinedDecorator &&
                        decoratorsStatus.hasValidateIfDecorator
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId:
                                "conflicting-defined-decorators-defined-validate-if",
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
    propertyDefinition: TSESTree.PropertyDefinition
): DecoratorsStatus {
    let hasIsDefinedDecorator = false;
    let hasTypeCheckingDecorator = false;
    let hasIsOptionalDecorator = false;
    let hasValidateIfDecorator = false;
    const program = typedTokenHelpers.getRootProgram(propertyDefinition);

    if (propertyDefinition.decorators) {
        for (const decorator of propertyDefinition.decorators) {
            if (
                decorator.expression.type === AST_NODE_TYPES.CallExpression &&
                decorator.expression.callee.type === AST_NODE_TYPES.Identifier
            ) {
                // if this is not a class-validator decorator, skip it (this avoids name conflicts with decorators from other libraries)
                if (
                    !typedTokenHelpers.decoratorIsClassValidatorDecorator(
                        program,
                        decorator
                    )
                ) {
                    continue;
                }
                // We care if the decorator is a validation decorator like IsString etc for checks later
                if (
                    decorator.expression.callee.name !== "IsDefined" &&
                    decorator.expression.callee.name !== "IsOptional" &&
                    decorator.expression.callee.name !== "ValidateIf"
                ) {
                    hasTypeCheckingDecorator = true;
                }
                // otherwise check if it is isDefined or isOptional, we will use this later
                if (decorator.expression.callee.name === "IsDefined") {
                    hasIsDefinedDecorator = true;
                }

                if (decorator.expression.callee.name === "IsOptional") {
                    hasIsOptionalDecorator = true;
                }
                if (decorator.expression.callee.name === "ValidateIf") {
                    hasValidateIfDecorator = true;
                }
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
