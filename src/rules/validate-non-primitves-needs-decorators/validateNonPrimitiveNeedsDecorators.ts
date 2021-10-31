/* eslint-disable unicorn/prevent-abbreviations */
import {TSESTree} from "@typescript-eslint/types";
import {createRule} from "../../utils/createRule";

// const nestRequestMethodDecoratorNames = new Set([
//     "Get",
//     "Post",
//     "Put",
//     "Delete",
//     "Patch",
//     "Options",
//     "Head",
//     "All",
// ]);

export const shouldTrigger = (): boolean => {
    return false;
};

const rule = createRule({
    name: "param-decorator-name-matches-route-param",
    meta: {
        docs: {
            description:
                "Properties that are not primitive types should ValidateNested",
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            shouldUseValidateNested:
                "A non-primitve type property with validation should use @ValidateNested",
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                // property is not a primitve type
                // property has a validation decorator

                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result = shouldTrigger();

                if (result) {
                    context.report({
                        node: node,
                        messageId: "shouldUseValidateNested",
                    });
                }
            },
        };
    },
});

export default rule;
