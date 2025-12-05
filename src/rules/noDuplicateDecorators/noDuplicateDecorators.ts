import {createRule} from "../../utils/createRule.js";
import {JSONSchema4TypeName} from "@typescript-eslint/utils/json-schema";
import {TSESTree} from "@typescript-eslint/utils";

export type NoDuplicateDecoratorsOptions = [
    {
        customList: string[];
    },
];
export const shouldTrigger = (): boolean => {
    return true;
};
export const standardDecoratorsToValidate = ["Controller", "Injectable"];
const rule = createRule<NoDuplicateDecoratorsOptions, "noDuplicateDecorators">({
    name: "no-duplicate-decorators",
    meta: {
        docs: {
            description:
                "Some decorators should only be used once on a property or class. This rule enforces that.",
        },
        messages: {
            noDuplicateDecorators:
                "You have listed the same decorator more than once. Was this intentional?",
        },
        schema: [
            {
                type: "object" as JSONSchema4TypeName,
                additionalProperties: false,
                properties: {
                    customList: {
                        description:
                            "A list of custom decorators that this rule will validate for duplicates",
                        type: "array" as JSONSchema4TypeName,
                        minItems: 0,
                        items: {
                            type: "string" as JSONSchema4TypeName,
                            minLength: 1,
                        },
                    },
                },
            },
        ],
        hasSuggestions: true,
        type: "suggestion",
    },
    defaultOptions: [
        {
            customList: new Array<string>(),
        },
    ],

    create(context) {
        const customListArrayItem = context.options[0];
        let decoratorsToValidate: string[] = customListArrayItem?.customList;
        if (
            !customListArrayItem?.customList ||
            customListArrayItem?.customList.length === 0
        ) {
            decoratorsToValidate = standardDecoratorsToValidate;
        }
        return {
            ["PropertyDefinition,ClassDeclaration"](node) {
                const allDecorators = (
                    node as
                        | TSESTree.PropertyDefinition
                        | TSESTree.ClassDeclaration
                ).decorators;
                if (allDecorators && allDecorators.length > 1) {
                    const decoratorNames = allDecorators.map(
                        (decorator): string => {
                            if (
                                decorator.expression.type ===
                                    TSESTree.AST_NODE_TYPES.CallExpression &&
                                decorator.expression.callee &&
                                decorator.expression.callee.type ===
                                    TSESTree.AST_NODE_TYPES.Identifier
                            ) {
                                return decorator.expression.callee.name;
                            }
                            return "";
                        }
                    );
                    const duplicateDecorators = decoratorNames.filter(
                        (decoratorName, index) => {
                            return (
                                decoratorName &&
                                decoratorNames.indexOf(decoratorName) !== index
                            );
                        }
                    );
                    if (
                        duplicateDecorators.length > 0 &&
                        decoratorsToValidate.some((decoratorToValidate) =>
                            duplicateDecorators.includes(decoratorToValidate)
                        )
                    ) {
                        context.report({
                            node: node,
                            messageId: "noDuplicateDecorators",
                            suggest: [
                                {
                                    messageId: "noDuplicateDecorators",
                                    fix: (fixer) => {
                                        const decoratorsToKeep =
                                            decoratorNames.filter(
                                                (decoratorName, index) => {
                                                    return (
                                                        decoratorName &&
                                                        decoratorNames.indexOf(
                                                            decoratorName
                                                        ) === index
                                                    );
                                                }
                                            );
                                        const decoratorsToKeepText =
                                            decoratorsToKeep.join(", ");
                                        return fixer.replaceText(
                                            node,
                                            decoratorsToKeepText
                                        );
                                    },
                                },
                            ],
                        });
                    }
                }
            },
        };
    },
});

export default rule;
