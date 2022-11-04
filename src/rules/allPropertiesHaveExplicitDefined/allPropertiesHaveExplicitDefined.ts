import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {isNullableType} from "@typescript-eslint/type-utils";
import {getPropertiesDefinitions} from "../../utils/ast";
import {createRule} from "../../utils/createRule";
import {getParserServices} from "@typescript-eslint/utils/dist/eslint-utils";
import {Type, TypeChecker} from "typescript";
import {ParserWeakMapESTreeToTSNode} from "@typescript-eslint/typescript-estree/dist/parser-options";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";

const rule = createRule({
    name: "all-properties-have-explicit-defined",
    meta: {
        docs: {
            description:
                "Enforce all properties have an explicit defined status decorator",
            recommended: "error",
            requiresTypeChecking: true,
        },
        messages: {
            "missing-is-defined-decorator":
                "Non-optional properties must have a decorator that checks the value is defined (for example: @IsDefined())",
            "missing-is-optional-decorator":
                "Optional properties must have @IsOptional() decorator",
            "conflicting-defined-decorators":
                "Properties can have @IsDefined() or @IsOptional() but not both",
        },
        type: "problem",
        schema: {},
    },
    defaultOptions: [],
    create: function (context) {
        const service = getParserServices(context);
        const {esTreeNodeToTSNodeMap} = service;
        const checker = service.program.getTypeChecker();
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(node) {
                const propertyDefinitionsWithDecoratorsStatus: Array<
                    [TSESTree.PropertyDefinition, DecoratorsStatus]
                > = [];
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

                    // It doesn't make sense to have both @IsDefined and @IsOptional decorators
                    if (
                        decoratorsStatus.hasIsDefinedDecorator &&
                        decoratorsStatus.hasIsOptionalDecorator
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId: "conflicting-defined-decorators",
                        });
                    }

                    if (
                        decoratorsStatus.hasIsDefinedDecorator ||
                        decoratorsStatus.hasTypeCheckingDecorator ||
                        decoratorsStatus.hasIsOptionalDecorator
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
                            esTreeNodeToTSNodeMap,
                            checker
                        );

                        // if the type is nullable, it should be optional
                        if (
                            propertyDefinition.optional ||
                            isNullableType(type)
                        ) {
                            if (!decoratorsStatus.hasIsOptionalDecorator) {
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

type DecoratorsStatus = {
    hasIsDefinedDecorator: boolean;
    hasTypeCheckingDecorator: boolean;
    hasIsOptionalDecorator: boolean;
};

function getType(
    typeNode: TSESTree.Node,
    esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode,
    checker: TypeChecker
): Type {
    const tsNode = esTreeNodeToTSNodeMap.get(typeNode);
    const type = checker.getTypeAtLocation(tsNode);
    return type;
}

function getDecoratorsStatus(
    propertyDefinition: TSESTree.PropertyDefinition
): DecoratorsStatus {
    let hasIsDefinedDecorator = false;
    let hasTypeCheckingDecorator = false;
    let hasIsOptionalDecorator = false;
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
                    decorator.expression.callee.name !== "IsOptional"
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
            }
        }
    }
    return {
        hasIsDefinedDecorator,
        hasTypeCheckingDecorator,
        hasIsOptionalDecorator,
    };
}
