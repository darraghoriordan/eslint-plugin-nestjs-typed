import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

interface SchemaReference {
    modelName: string;
    node: TSESTree.Node;
}

/**
 * Extracts model names from getSchemaPath() calls within oneOf/allOf/anyOf arrays
 */
const extractModelsFromSchemaReferences = (
    arrayExpression: TSESTree.ArrayExpression
): SchemaReference[] => {
    const models: SchemaReference[] = [];

    for (const element of arrayExpression.elements) {
        if (element?.type === AST_NODE_TYPES.ObjectExpression) {
            // Look for { $ref: getSchemaPath(ModelName) }
            const referenceProperty = element.properties.find(
                (property) =>
                    property.type === AST_NODE_TYPES.Property &&
                    property.key.type === AST_NODE_TYPES.Identifier &&
                    property.key.name === "$ref"
            ) as TSESTree.Property | undefined;

            if (
                referenceProperty &&
                referenceProperty.value.type === AST_NODE_TYPES.CallExpression
            ) {
                const callExpression = referenceProperty.value;
                // Check if it's a getSchemaPath call
                if (
                    callExpression.callee.type === AST_NODE_TYPES.Identifier &&
                    callExpression.callee.name === "getSchemaPath" &&
                    callExpression.arguments.length > 0
                ) {
                    const firstArgument = callExpression.arguments[0];
                    if (firstArgument.type === AST_NODE_TYPES.Identifier) {
                        models.push({
                            modelName: firstArgument.name,
                            node: firstArgument,
                        });
                    }
                }
            }
        }
    }

    return models;
};

/**
 * Finds the parent class declaration of a property definition
 */
const findParentClass = (
    node: TSESTree.PropertyDefinition
): TSESTree.ClassDeclaration | null => {
    let parent: TSESTree.Node | undefined = node.parent;
    while (parent) {
        if (parent.type === AST_NODE_TYPES.ClassDeclaration) {
            return parent as TSESTree.ClassDeclaration;
        }
        parent = parent.parent;
    }
    return null;
};

/**
 * Extracts model names from @ApiExtraModels decorator arguments
 */
const getModelsFromApiExtraModels = (
    classNode: TSESTree.ClassDeclaration
): Set<string> => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(classNode, [
        "ApiExtraModels",
    ]);

    if (decorators.length === 0) {
        return new Set();
    }

    const models = new Set<string>();

    for (const decorator of decorators) {
        if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) {
            continue;
        }

        // Extract all arguments (model identifiers) from @ApiExtraModels(Cat, Dog, ...)
        for (const argument of decorator.expression.arguments) {
            if (argument.type === AST_NODE_TYPES.Identifier) {
                models.add(argument.name);
            }
        }
    }

    return models;
};

/**
 * Checks if a property definition uses oneOf/allOf/anyOf with model references
 */
const getModelsFromApiPropertyDecorator = (
    node: TSESTree.PropertyDefinition
): SchemaReference[] => {
    const decorators = typedTokenHelpers.getDecoratorsNamed(node, [
        "ApiProperty",
        "ApiPropertyOptional",
    ]);

    if (decorators.length === 0) {
        return [];
    }

    if (decorators[0].expression.type !== AST_NODE_TYPES.CallExpression) {
        return [];
    }

    const firstArgument = decorators[0].expression.arguments[0];

    // Only process object expressions
    if (
        !firstArgument ||
        firstArgument.type !== AST_NODE_TYPES.ObjectExpression
    ) {
        return [];
    }

    const models: SchemaReference[] = [];

    // Check for oneOf, allOf, anyOf properties
    for (const property of firstArgument.properties) {
        if (
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier &&
            ["oneOf", "allOf", "anyOf"].includes(property.key.name)
        ) {
            // The value should be an array expression
            if (property.value.type === AST_NODE_TYPES.ArrayExpression) {
                const extractedModels = extractModelsFromSchemaReferences(
                    property.value
                );
                models.push(...extractedModels);
            }
        }
    }

    return models;
};

const rule = createRule<[], "shouldUseApiExtraModels">({
    name: "api-property-should-have-api-extra-models",
    meta: {
        docs: {
            description:
                "Ensures models referenced in oneOf, allOf, or anyOf within ApiProperty decorators are declared in ApiExtraModels",
        },
        messages: {
            shouldUseApiExtraModels: `Model '{{modelName}}' is referenced in {{schemaType}} but may not be included in @ApiExtraModels(). Ensure it is added to @ApiExtraModels() on a controller or included directly in an endpoint response type.`,
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                const models = getModelsFromApiPropertyDecorator(node);

                if (models.length > 0) {
                    // Find the parent class and check for @ApiExtraModels
                    const parentClass = findParentClass(node);
                    const declaredModels = parentClass
                        ? getModelsFromApiExtraModels(parentClass)
                        : new Set<string>();

                    // Determine which schema type is being used
                    const decorators = typedTokenHelpers.getDecoratorsNamed(
                        node,
                        ["ApiProperty", "ApiPropertyOptional"]
                    );

                    let schemaType = "oneOf/allOf/anyOf";
                    if (
                        decorators.length > 0 &&
                        decorators[0].expression.type ===
                            AST_NODE_TYPES.CallExpression
                    ) {
                        const firstArgument =
                            decorators[0].expression.arguments[0];
                        if (
                            firstArgument &&
                            firstArgument.type ===
                                AST_NODE_TYPES.ObjectExpression
                        ) {
                            for (const property of firstArgument.properties) {
                                if (
                                    property.type === AST_NODE_TYPES.Property &&
                                    property.key.type ===
                                        AST_NODE_TYPES.Identifier
                                ) {
                                    const key = property.key.name;
                                    if (
                                        ["oneOf", "allOf", "anyOf"].includes(
                                            key
                                        )
                                    ) {
                                        schemaType = key;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    // Report each model that is not declared in @ApiExtraModels
                    for (const model of models) {
                        if (!declaredModels.has(model.modelName)) {
                            context.report({
                                node: model.node,
                                messageId: "shouldUseApiExtraModels",
                                data: {
                                    modelName: model.modelName,
                                    schemaType: schemaType,
                                },
                            });
                        }
                    }
                }
            },
        };
    },
});

export default rule;
