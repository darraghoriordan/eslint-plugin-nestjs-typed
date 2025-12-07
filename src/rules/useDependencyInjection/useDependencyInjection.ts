import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

// Decorators that indicate a class should use dependency injection
const INJECTABLE_DECORATORS = [
    "Injectable",
    "Controller",
    "Component", // Legacy NestJS decorator
    "Service", // Common alias
];

const rule = createRule<[], "useDependencyInjection">({
    name: "use-dependency-injection",
    meta: {
        docs: {
            description:
                "Enforce dependency injection through constructor parameters rather than property initialization. Services and controllers should not instantiate their dependencies directly.",
        },
        messages: {
            useDependencyInjection:
                "Dependencies must be provided through the class constructor, not instantiated directly. This violates the dependency injection principle.",
        },
        schema: [],
        hasSuggestions: false,
        type: "problem",
    },
    defaultOptions: [],

    create(context) {
        let isInjectableClass = false;
        let currentConstructor: TSESTree.MethodDefinition | null = null;
        const programImports: Set<string> = new Set<string>();
        const programVariables: Set<string> = new Set<string>();

        return {
            // Track all imports at the program level
            ImportDeclaration(node: TSESTree.ImportDeclaration): void {
                node.specifiers.forEach((specifier) => {
                    if (specifier.local?.name) {
                        programImports.add(specifier.local.name);
                    }
                });
            },

            // Track top-level variable declarations (like const bunyan = require('bunyan'))
            "Program > VariableDeclaration"(
                node: TSESTree.VariableDeclaration
            ): void {
                node.declarations.forEach((declaration) => {
                    if (
                        declaration.id.type ===
                        TSESTree.AST_NODE_TYPES.Identifier
                    ) {
                        programVariables.add(declaration.id.name);
                    }
                });
            },

            // Track when we enter a class that should use DI
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                isInjectableClass = typedTokenHelpers.nodeHasDecoratorsNamed(
                    node,
                    INJECTABLE_DECORATORS
                );
            },

            // Track when we exit the class
            "ClassDeclaration:exit"(): void {
                isInjectableClass = false;
            },

            // Track when we enter a constructor
            MethodDefinition(node: TSESTree.MethodDefinition): void {
                if (
                    node.key.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    node.key.name === "constructor"
                ) {
                    currentConstructor = node;
                }
            },

            // Track when we exit a constructor
            "MethodDefinition:exit"(node: TSESTree.MethodDefinition): void {
                if (
                    node.key.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    node.key.name === "constructor"
                ) {
                    currentConstructor = null;
                }
            },

            // Check property definitions with initializers
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                if (!isInjectableClass || !node.value) {
                    return;
                }

                // Check for new expressions: private logger = new Logger()
                if (node.value.type === TSESTree.AST_NODE_TYPES.NewExpression) {
                    context.report({
                        node: node.value,
                        messageId: "useDependencyInjection",
                    });
                    return;
                }

                // Check for require calls: private logger = require('bunyan')
                if (
                    node.value.type ===
                        TSESTree.AST_NODE_TYPES.CallExpression &&
                    node.value.callee.type ===
                        TSESTree.AST_NODE_TYPES.Identifier &&
                    node.value.callee.name === "require"
                ) {
                    context.report({
                        node: node.value,
                        messageId: "useDependencyInjection",
                    });
                    return;
                }

                // Check for identifiers from imports/variables: private logger = bunyan
                if (
                    node.value.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    (programImports.has(node.value.name) ||
                        programVariables.has(node.value.name))
                ) {
                    context.report({
                        node: node.value,
                        messageId: "useDependencyInjection",
                    });
                    return;
                }
            },

            // Check assignments in constructor: this.logger = new Logger()
            AssignmentExpression(node: TSESTree.AssignmentExpression): void {
                if (
                    !isInjectableClass ||
                    !currentConstructor ||
                    node.operator !== "="
                ) {
                    return;
                }

                // Check if it's assigning to a class member (this.property)
                if (
                    node.left.type ===
                        TSESTree.AST_NODE_TYPES.MemberExpression &&
                    node.left.object.type ===
                        TSESTree.AST_NODE_TYPES.ThisExpression &&
                    node.right.type === TSESTree.AST_NODE_TYPES.NewExpression
                ) {
                    context.report({
                        node: node.right,
                        messageId: "useDependencyInjection",
                    });
                }
            },
        };
    },
});

export default rule;
