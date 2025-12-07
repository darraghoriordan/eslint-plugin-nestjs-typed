import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";
import {JSONSchema4TypeName} from "@typescript-eslint/utils/json-schema";

type RuleMessageIds =
    | "controllerPathShouldBePlural"
    | "controllerPathShouldBeKebabCase"
    | "routePathShouldBeKebabCase";

type RuleOptions = [
    {
        checkPluralization: boolean;
        caseFormat: "kebab-case" | "snake_case" | "camelCase";
    },
];

const nestRequestMethodDecoratorNames = [
    "Get",
    "Post",
    "Put",
    "Delete",
    "Patch",
    "Options",
    "Head",
    "All",
];

/**
 * Checks if a path segment is in kebab-case format
 */
const isKebabCase = (segment: string): boolean => {
    return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(segment);
};

/**
 * Checks if a path segment is in snake_case format
 */
const isSnakeCase = (segment: string): boolean => {
    return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(segment);
};

/**
 * Checks if a path segment is in camelCase format
 */
const isCamelCase = (segment: string): boolean => {
    return /^[a-z][a-zA-Z0-9]*$/.test(segment);
};

/**
 * Simple pluralization check - checks if word ends with 's'
 * This is a basic implementation. For more complex pluralization,
 * users can disable this check.
 */
const isPlural = (word: string): boolean => {
    // Basic check: ends with 's' and not just 's'
    return word.length > 1 && word.endsWith("s");
};

/**
 * Extracts the path string from a decorator
 */
const getDecoratorPath = (
    decorator: TSESTree.Decorator
): string | null | undefined => {
    const decoratorArgument = (decorator?.expression as TSESTree.CallExpression)
        ?.arguments[0];

    if (!decoratorArgument) {
        return null;
    }

    // Skip template literals and identifiers (dynamic paths)
    if (
        decoratorArgument.type === TSESTree.AST_NODE_TYPES.TemplateLiteral ||
        decoratorArgument.type === TSESTree.AST_NODE_TYPES.Identifier
    ) {
        return undefined;
    }

    if (decoratorArgument.type === TSESTree.AST_NODE_TYPES.Literal) {
        return decoratorArgument.value as string;
    }

    return null;
};

/**
 * Extracts path segments from a path, excluding route parameters
 */
const getPathSegments = (path: string): string[] => {
    return path
        .split("/")
        .filter((segment) => segment.length > 0)
        .filter((segment) => !segment.startsWith(":"))
        .filter((segment) => segment !== "*");
};

/**
 * Checks if a path matches the expected case format
 */
const matchesCaseFormat = (
    path: string,
    format: "kebab-case" | "snake_case" | "camelCase"
): boolean => {
    const segments = getPathSegments(path);

    if (segments.length === 0) {
        return true;
    }

    for (const segment of segments) {
        let isValid = false;
        switch (format) {
            case "kebab-case":
                isValid = isKebabCase(segment);
                break;
            case "snake_case":
                isValid = isSnakeCase(segment);
                break;
            case "camelCase":
                isValid = isCamelCase(segment);
                break;
        }
        if (!isValid) {
            return false;
        }
    }

    return true;
};

const defaultRuleOptions: RuleOptions = [
    {
        checkPluralization: true,
        caseFormat: "kebab-case",
    },
];

const rule = createRule<RuleOptions, RuleMessageIds>({
    name: "use-correct-endpoint-naming-convention",
    meta: {
        docs: {
            description:
                "Enforces REST API naming conventions for controller and route paths",
        },
        messages: {
            controllerPathShouldBePlural:
                'Controller path "{{path}}" should be plural (e.g., "{{path}}s"). You can disable this check by setting checkPluralization to false.',
            controllerPathShouldBeKebabCase:
                'Controller path "{{path}}" should be in {{format}} format.',
            routePathShouldBeKebabCase:
                'Route path "{{path}}" should be in {{format}} format.',
        },
        schema: [
            {
                type: "object" as JSONSchema4TypeName,
                additionalProperties: false,
                properties: {
                    checkPluralization: {
                        description:
                            "Check that controller paths use plural resource names",
                        type: "boolean",
                    },
                    caseFormat: {
                        description:
                            "The case format to enforce for paths. Options: kebab-case, snake_case, camelCase",
                        type: "string",
                        enum: ["kebab-case", "snake_case", "camelCase"],
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: defaultRuleOptions,

    create(context) {
        const options =
            context.options && context.options.length > 0
                ? context.options[0]
                : defaultRuleOptions[0];

        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                const hasControllerDecorator =
                    typedTokenHelpers.nodeHasDecoratorsNamed(node, [
                        "Controller",
                    ]);

                if (!hasControllerDecorator) {
                    return;
                }

                const controllerDecorator =
                    typedTokenHelpers.getDecoratorsNamed(node, ["Controller"]);

                if (controllerDecorator.length === 0) {
                    return;
                }

                const path = getDecoratorPath(controllerDecorator[0]);

                // Skip if no path, dynamic path, or empty string
                if (path === null || path === undefined || path === "") {
                    return;
                }

                const segments = getPathSegments(path);

                // Check pluralization for the main resource (first segment)
                if (options.checkPluralization && segments.length > 0) {
                    const mainResource = segments[0];
                    if (!isPlural(mainResource)) {
                        context.report({
                            node: controllerDecorator[0],
                            messageId: "controllerPathShouldBePlural",
                            data: {
                                path: mainResource,
                            },
                        });
                    }
                }

                // Check case format
                if (!matchesCaseFormat(path, options.caseFormat)) {
                    context.report({
                        node: controllerDecorator[0],
                        messageId: "controllerPathShouldBeKebabCase",
                        data: {
                            path: path,
                            format: options.caseFormat,
                        },
                    });
                }
            },
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                const hasApiMethodDecorator =
                    typedTokenHelpers.nodeHasDecoratorsNamed(
                        node,
                        nestRequestMethodDecoratorNames
                    );

                if (!hasApiMethodDecorator) {
                    return;
                }

                const methodDecorators = typedTokenHelpers.getDecoratorsNamed(
                    node,
                    nestRequestMethodDecoratorNames
                );

                for (const decorator of methodDecorators) {
                    const path = getDecoratorPath(decorator);

                    // Skip if no path, dynamic path, or empty string
                    if (path === null || path === undefined || path === "") {
                        continue;
                    }

                    // Check case format
                    if (!matchesCaseFormat(path, options.caseFormat)) {
                        context.report({
                            node: decorator,
                            messageId: "routePathShouldBeKebabCase",
                            data: {
                                path: path,
                                format: options.caseFormat,
                            },
                        });
                    }
                }
            },
        };
    },
});

export default rule;
