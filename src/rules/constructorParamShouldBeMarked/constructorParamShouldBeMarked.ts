import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";
import {JSONSchema4TypeName} from "@typescript-eslint/utils/json-schema";

function getConstructor(
    node: TSESTree.ClassDeclaration
): TSESTree.MethodDefinition | null {
    try {
        return (node.body?.body ?? []).find(
            (md) =>
                typeof (md as TSESTree.MethodDefinition).kind !== "undefined" &&
                (md as TSESTree.MethodDefinition).kind === "constructor"
        ) as TSESTree.MethodDefinition;
    } catch (e) {
        return null;
    }
}

function hasDecorators(param: TSESTree.TSParameterProperty) {
    return param.decorators && param.decorators.length;
}

const rule = createRule({
    name: "constructor-param-should-be-marked",
    meta: {
        docs: {
            description:
                "Constructor should have all dependencies marked with at least one decorator like @Inject() or @InjectRepository() or other similar.",
        },
        messages: {
            injectInConstructor: `Constructor parameters should be marked with @Inject() or similar decorator.`,
        },
        schema: [
            {
                type: "object" as JSONSchema4TypeName,
                properties: {
                    src: {
                        description:
                            "files/paths to be analyzed (only for provided injectable or controller)",
                        type: "array" as JSONSchema4TypeName,
                        minItems: 1,
                        items: {
                            type: "string" as JSONSchema4TypeName,
                            minLength: 1,
                        },
                    },
                    filterFromPaths: {
                        description:
                            "strings to exclude from checks (only for provided injectable or controller)",
                        type: "array" as JSONSchema4TypeName,
                        minItems: 1,
                        items: {
                            type: "string" as JSONSchema4TypeName,
                            minLength: 1,
                        },
                    },
                },
            },
        ],
        type: "problem",
    },
    defaultOptions: [
        {
            src: ["src/**/*.ts"],
            filterFromPaths: ["dist", "node_modules", ".test.", ".spec."],
        },
    ],

    create(context) {
        return {
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                const constructor = getConstructor(node);

                if (!constructor) {
                    return;
                }

                for (const param of constructor.value.params) {
                    if (!hasDecorators(param as TSESTree.TSParameterProperty)) {
                        context.report({
                            messageId: "injectInConstructor",
                            node,
                        });
                    }
                }
            },
        };
    },
});

export default rule;
