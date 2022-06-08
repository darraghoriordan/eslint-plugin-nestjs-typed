import {AST_NODE_TYPES} from "@typescript-eslint/utils";
import {isNullableType} from "@typescript-eslint/type-utils";
import {
    PropertyDefinition,
    TypeNode,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import {getPropertiesDefinitions} from "../../utils/ast";
import {createRule} from "../../utils/createRule";
import {getParserServices} from "@typescript-eslint/utils/dist/eslint-utils";
import {Type, TypeChecker} from "typescript";
import {ParserWeakMapESTreeToTSNode} from "@typescript-eslint/typescript-estree/dist/parser-options";
import {classValidatorDecorators} from "../../utils/classValidatorDecorators";

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
                    [PropertyDefinition, DecoratorsStatus]
                > = [];
                let withDecoratorCount = 0;
                const propertyDefinitions = getPropertiesDefinitions(node);
                for (const propertyDefinition of propertyDefinitions) {
                    const decoratorsStatus =
                        getDecoratorsStatus(propertyDefinition);
                    propertyDefinitionsWithDecoratorsStatus.push([
                        propertyDefinition,
                        decoratorsStatus,
                    ]);
                    if (
                        decoratorsStatus.isDefined &&
                        decoratorsStatus.isOptional
                    ) {
                        context.report({
                            node: propertyDefinition,
                            messageId: "conflicting-defined-decorators",
                        });
                    }
                    if (
                        decoratorsStatus.isDefined ||
                        decoratorsStatus.hasTypeCheckingDecorator ||
                        decoratorsStatus.isOptional
                    ) {
                        withDecoratorCount++;
                    }
                }
                if (withDecoratorCount > 0) {
                    for (const [
                        propertyDefinition,
                        decoratorsStatus,
                    ] of propertyDefinitionsWithDecoratorsStatus) {
                        if (!propertyDefinition.typeAnnotation) {
                            continue;
                        }
                        const type = getType(
                            propertyDefinition.typeAnnotation.typeAnnotation,
                            esTreeNodeToTSNodeMap,
                            checker
                        );
                        if (
                            propertyDefinition.optional ||
                            isNullableType(type)
                        ) {
                            if (!decoratorsStatus.isOptional) {
                                context.report({
                                    node: propertyDefinition,
                                    messageId: "missing-is-optional-decorator",
                                });
                            }
                        } else {
                            if (
                                !decoratorsStatus.isDefined &&
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
    isDefined: boolean;
    hasTypeCheckingDecorator: boolean;
    isOptional: boolean;
};

function getType(
    typeNode: TypeNode,
    esTreeNodeToTSNodeMap: ParserWeakMapESTreeToTSNode,
    checker: TypeChecker
): Type {
    const tsNode = esTreeNodeToTSNodeMap.get(typeNode);
    const type = checker.getTypeAtLocation(tsNode);
    return type;
}

function getDecoratorsStatus(
    propertyDefinition: PropertyDefinition
): DecoratorsStatus {
    let isDefined = false;
    let hasTypeCheckingDecorator = false;
    let isOptional = false;
    if (propertyDefinition.decorators) {
        for (const decorator of propertyDefinition.decorators) {
            if (
                decorator.expression.type === AST_NODE_TYPES.CallExpression &&
                decorator.expression.callee.type === AST_NODE_TYPES.Identifier
            ) {
                if (decorator.expression.callee.name === "IsDefined") {
                    isDefined = true;
                }
                if (
                    classValidatorDecorators.includes(
                        decorator.expression.callee.name
                    )
                ) {
                    hasTypeCheckingDecorator = true;
                }
                if (decorator.expression.callee.name === "IsOptional") {
                    isOptional = true;
                }
            }
        }
    }
    return {isDefined, hasTypeCheckingDecorator, isOptional};
}
