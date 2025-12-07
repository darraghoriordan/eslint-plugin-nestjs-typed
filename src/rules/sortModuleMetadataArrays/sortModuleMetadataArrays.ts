import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {MODULE_CLASS_DECORATOR} from "../../utils/wellKnownSelectors.js";
import {ASTUtils} from "@typescript-eslint/utils";
import {RuleContext} from "@typescript-eslint/utils/ts-eslint";
// Inspired by https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/src/rules/sort-ngmodule-metadata-arrays.ts

const DEFAULT_LOCALE = "en-US";

export type RuleOptions = [
    {
        locale?: string;
    },
];

export type ValidModuleNodeTypes =
    | TSESTree.Identifier
    | TSESTree.CallExpression;

export const isValidModuleMetaPropertyType = (
    node: TSESTree.Expression | TSESTree.SpreadElement | null
): node is ValidModuleNodeTypes => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (!!node &&
        ASTUtils.isNodeOfTypes([
            TSESTree.AST_NODE_TYPES.Identifier,
            TSESTree.AST_NODE_TYPES.CallExpression,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ])) as any; // unsure about this type
};
export const getRelevantNodeName = (node: TSESTree.Node) => {
    let currentName = "";

    if (node.type === TSESTree.AST_NODE_TYPES.Identifier) {
        currentName = node.name;
    }
    if (
        node.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        node.callee.type === TSESTree.AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === TSESTree.AST_NODE_TYPES.Identifier
    ) {
        currentName = node.callee.object.name;
    }
    return currentName;
};

/**
 * Checks if an ArrayExpression is the `inject` array of a factory provider.
 * Factory providers have both `useFactory` and `inject` properties,
 * and the order of `inject` must match the factory function parameters.
 */
export const isFactoryProviderInjectArray = (
    node: TSESTree.ArrayExpression
): boolean => {
    // Check if this array is a direct child of a Property
    if (!node.parent || node.parent.type !== TSESTree.AST_NODE_TYPES.Property) {
        return false;
    }

    const property = node.parent;

    // Check if this Property has the key "inject"
    if (
        property.key.type !== TSESTree.AST_NODE_TYPES.Identifier ||
        property.key.name !== "inject"
    ) {
        return false;
    }

    // Check if the parent of this Property is an ObjectExpression
    if (
        !property.parent ||
        property.parent.type !== TSESTree.AST_NODE_TYPES.ObjectExpression
    ) {
        return false;
    }

    const objectExpression = property.parent;

    // Check if this ObjectExpression has a `useFactory` property
    // If it does, this is a factory provider and the inject array should NOT be sorted
    // Note: In NestJS, `useFactory` and `inject` are always identifier properties,
    // not computed properties or method definitions, so we only check for identifiers
    const hasUseFactory = objectExpression.properties.some((property) => {
        return (
            property.type === TSESTree.AST_NODE_TYPES.Property &&
            property.key.type === TSESTree.AST_NODE_TYPES.Identifier &&
            property.key.name === "useFactory"
        );
    });

    return hasUseFactory;
};
const defaultLocaleOptions = [
    {
        locale: DEFAULT_LOCALE,
    },
] as RuleOptions;
export default createRule<RuleOptions, "moduleMetadataArraysAreSorted">({
    name: "sort-module-metadata-arrays",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Ensures ASC alphabetical order for `Module` metadata arrays for easy visual scanning",
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    locale: {
                        type: "string",
                        description: "A string with a BCP 47 language tag.",
                        default: DEFAULT_LOCALE,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            moduleMetadataArraysAreSorted:
                "`Module` metadata arrays should be sorted in ASC alphabetical order",
        },
    },
    defaultOptions: defaultLocaleOptions,
    create(contextWithoutDefaults) {
        const context =
            contextWithoutDefaults.options &&
            contextWithoutDefaults.options.length > 0
                ? contextWithoutDefaults
                : // only apply the defaults when the user provides no config
                  (Object.setPrototypeOf(
                      {
                          options: defaultLocaleOptions,
                      },
                      contextWithoutDefaults
                  ) as Readonly<
                      RuleContext<"moduleMetadataArraysAreSorted", RuleOptions>
                  >);

        const {locale} = context.options[0];
        const sourceCode = context.sourceCode;
        return {
            [`${MODULE_CLASS_DECORATOR} Property > ArrayExpression`](
                node: TSESTree.ArrayExpression
            ) {
                // Skip sorting if this is a factory provider's inject array
                // The order must match the useFactory function parameters
                if (isFactoryProviderInjectArray(node)) {
                    return;
                }

                const {elements} = node;
                const unorderedNodes = elements
                    // nestjs modules use identifiers and call expressions
                    // can modify this later
                    .filter(isValidModuleMetaPropertyType)
                    .map((current, index, list) => [current, list[index + 1]])
                    .find(([current, next]) => {
                        return (
                            current &&
                            next &&
                            getRelevantNodeName(current).localeCompare(
                                getRelevantNodeName(next),
                                locale
                            ) === 1
                        );
                    });

                if (!unorderedNodes) return;

                const [unorderedNode, nextNode] = unorderedNodes;
                context.report({
                    node: nextNode, // can't really be null
                    messageId: "moduleMetadataArraysAreSorted",
                    fix: (fixer) => [
                        fixer.replaceText(
                            unorderedNode,
                            sourceCode.getText(nextNode)
                        ),
                        fixer.replaceText(
                            nextNode,
                            sourceCode.getText(unorderedNode)
                        ),
                    ],
                });
            },
        };
    },
});
