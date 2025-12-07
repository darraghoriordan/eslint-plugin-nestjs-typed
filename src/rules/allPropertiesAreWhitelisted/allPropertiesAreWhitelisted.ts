import {AST_NODE_TYPES, TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers.js";

type Options = [
    {
        additionalDecorators?: string[];
    },
];

const rule = createRule<Options, "missing-property-decorator">({
    name: "all-properties-are-whitelisted",
    meta: {
        docs: {
            description: "Enforce all properties are whitelisted",
        },
        messages: {
            "missing-property-decorator":
                "Property has no class-validator decorator (use @Allow() if you don't need a validation)",
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
        const {additionalDecorators = []} = context.options[0] || {};

        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration) {
                const withDecorator: TSESTree.PropertyDefinition[] = [];
                const withoutDecorator: TSESTree.PropertyDefinition[] = [];
                for (const element of node.body.body) {
                    if (element.type !== AST_NODE_TYPES.PropertyDefinition) {
                        continue;
                    }
                    const validationDecorators =
                        typedTokenHelpers.getValidationDecorators(
                            element,
                            additionalDecorators
                        );
                    const hasDecorator = validationDecorators.length > 0;

                    if (hasDecorator) {
                        withDecorator.push(element);
                    } else {
                        withoutDecorator.push(element);
                    }
                }
                if (withDecorator.length > 0 && withoutDecorator.length > 0) {
                    for (const element of withoutDecorator) {
                        context.report({
                            node: element,
                            messageId: "missing-property-decorator",
                        });
                    }
                }
            },
        };
    },
});

export default rule;
