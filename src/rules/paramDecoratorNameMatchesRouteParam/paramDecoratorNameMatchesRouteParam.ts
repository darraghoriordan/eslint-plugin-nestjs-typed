/* eslint-disable unicorn/prevent-abbreviations */
import {TSESTree} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule.js";
import {RuleContext} from "@typescript-eslint/utils/ts-eslint";
import {JSONSchema4TypeName} from "@typescript-eslint/utils/json-schema";

interface ResultModel {
    hasColonInName: boolean;
    paramNameNotMatchedInPath: boolean;
    paramName?: string;
}

type RuleMessageIds =
    | "paramIdentifierDoesntNeedColon"
    | "paramIdentifierShouldMatchRouteOrController"
    | "paramIdentifierShouldMatchRouteOnly";

type RuleOptions = [
    {
        shouldCheckController: boolean;
    },
];

const nestRequestMethodDecoratorNames = new Set([
    "Get",
    "Post",
    "Put",
    "Delete",
    "Patch",
    "Options",
    "Head",
    "All",
    "Sse",
]);

export const parsePathParts = (decorator: TSESTree.Decorator): string[] => {
    const decoratorArgument = (decorator?.expression as TSESTree.CallExpression)
        ?.arguments[0];

    if (
        decoratorArgument?.type === TSESTree.AST_NODE_TYPES.TemplateLiteral ||
        decoratorArgument?.type === TSESTree.AST_NODE_TYPES.Identifier
    ) {
        return ["dareslint__skip"];
    }

    if (decoratorArgument?.type === TSESTree.AST_NODE_TYPES.Literal) {
        return [decoratorArgument.raw];
    }
    if (decoratorArgument?.type === TSESTree.AST_NODE_TYPES.ArrayExpression) {
        return decoratorArgument.elements.map(
            (x) => (x as TSESTree.Literal).raw
        );
    }
    if (decoratorArgument?.type === TSESTree.AST_NODE_TYPES.ObjectExpression) {
        return decoratorArgument.properties
            .filter(
                (x) =>
                    ((x as TSESTree.Property).key as TSESTree.Identifier)
                        .name === "path"
            )
            .map(
                (x) => ((x as TSESTree.Property).value as TSESTree.Literal).raw
            );
    }
    return [];
};

/**
 * nestjs allows for paths with _+?()*
 * this rule doesn't support parsing those so we'll just pass
 */
export const hasPathPartsAnyRegexParams = (
    pathPartsToCheck: string[]
): boolean => {
    // prettier-ignore

    const specialCharacterRegex = /(dareslint__skip|\*|\+|\?|\(|\)|_)/ //new RegExp("([\?\+\*\_\(\)])")
    return pathPartsToCheck.some((pathPart) => {
        return specialCharacterRegex.test(pathPart);
    });
};

/**
 * Checks if there is a matching path part for the paramName
 * @param paramName
 * @param pathPartsToCheck
 * @returns
 */
export const isParameterNameIncludedInAPathPart = (
    paramName: string,
    pathPartsToCheck: string[]
): boolean => {
    return pathPartsToCheck.some((pathPart) => {
        return (
            // note to reader: this might be better as a regex. feel free to open a pr!
            pathPart === `":${paramName}"` ||
            pathPart === `':${paramName}'` ||
            pathPart.includes(`/:${paramName}/`) ||
            pathPart.includes(`/:${paramName}"`) ||
            pathPart.includes(`":${paramName}/`) ||
            pathPart.includes(`/:${paramName}'`) ||
            pathPart.includes(`':${paramName}/`)
        );
    });
};

export const shouldTrigger = (
    decorator: TSESTree.Decorator,
    ruleOptions: RuleOptions
): ResultModel => {
    if (!decorator) {
        return {
            hasColonInName: false,
            paramNameNotMatchedInPath: false,
        };
    }
    // grab the param name
    const paramName = (
        (decorator?.expression as TSESTree.CallExpression)
            .arguments[0] as TSESTree.Literal
    )?.value as string;

    // if there's no param name get out of here
    if (!paramName || paramName === "") {
        return {
            hasColonInName: false,
            paramNameNotMatchedInPath: false,
        };
    }
    // param names don't need the colon
    if (paramName.startsWith(":")) {
        return {
            hasColonInName: true,
            paramNameNotMatchedInPath: false,
        };
    }

    let pathPartsToCheck: string[] = [];

    // grab any controller path parts
    if (ruleOptions[0].shouldCheckController) {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const controllerDecorator = (
            decorator.parent.parent?.parent?.parent
                ?.parent as TSESTree.ClassDeclaration
        ).decorators.find((d) => {
            return (
                (
                    (d.expression as TSESTree.CallExpression)
                        .callee as TSESTree.Identifier
                ).name === "Controller"
            );
        }) as TSESTree.Decorator;

        pathPartsToCheck = pathPartsToCheck.concat(
            parsePathParts(controllerDecorator)
        );
    }

    // grab any api method path parts from method decorator
    const methodDefinition = decorator.parent.parent
        ?.parent as TSESTree.MethodDefinition;

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const methodDecorator = methodDefinition.decorators.find((d) => {
        return nestRequestMethodDecoratorNames.has(
            (
                (d.expression as TSESTree.CallExpression)
                    .callee as TSESTree.Identifier
            ).name
        );
    }) as TSESTree.Decorator;

    pathPartsToCheck = pathPartsToCheck.concat(parsePathParts(methodDecorator));
    const shouldIgnoreThisSetOfRoutes =
        // is a template literal argument

        // is an identifier argument
        hasPathPartsAnyRegexParams(pathPartsToCheck);

    if (shouldIgnoreThisSetOfRoutes) {
        return {
            hasColonInName: false,
            paramNameNotMatchedInPath: false,
        };
    }
    // check that the param name is in one path part
    return {
        hasColonInName: false,
        paramNameNotMatchedInPath: !isParameterNameIncludedInAPathPart(
            paramName,
            pathPartsToCheck
        ),
        paramName,
    };
};

const defaultRuleOptions: RuleOptions = [{shouldCheckController: true}];

const rule = createRule<RuleOptions, RuleMessageIds>({
    name: "param-decorator-name-matches-route-param",
    meta: {
        docs: {
            description:
                'Param decorators with a name parameter e.g. Param("myvar") should match a specified route parameter - e.g. Get(":myvar")',
        },
        messages: {
            paramIdentifierDoesntNeedColon:
                "You don't need to specify the colon (:) in a Param decorator",
            paramIdentifierShouldMatchRouteOrController:
                'The Param "{{paramName}}" could not be found in the related route or controller',
            paramIdentifierShouldMatchRouteOnly:
                'The Param "{{paramName}}" could not be found in the related route',
        },
        schema: [
            {
                type: "object" as JSONSchema4TypeName,
                properties: {
                    shouldCheckController: {
                        description:
                            "If the name in the @Controller() decorator should be checked for route param matches or not. Turn this option off if you use variable for Controller paths that do not contain route params.",
                        type: "boolean",
                    },
                },
            },
        ],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: defaultRuleOptions,

    create(contextWithoutDefaults) {
        const context =
            contextWithoutDefaults.options &&
            contextWithoutDefaults.options.length > 0
                ? contextWithoutDefaults
                : // only apply the defaults when the user provides no config
                  (Object.setPrototypeOf(
                      {
                          options: defaultRuleOptions,
                      },
                      contextWithoutDefaults
                  ) as Readonly<RuleContext<RuleMessageIds, RuleOptions>>);

        return {
            Decorator(node: TSESTree.Decorator): void {
                if (
                    (
                        (node.expression as TSESTree.CallExpression)
                            .callee as TSESTree.Identifier
                    ).name !== "Param"
                ) {
                    return;
                }

                const result = shouldTrigger(node, context.options);

                if (result.paramNameNotMatchedInPath) {
                    context.report({
                        node: node,
                        messageId: context.options[0].shouldCheckController
                            ? "paramIdentifierShouldMatchRouteOrController"
                            : "paramIdentifierShouldMatchRouteOnly",
                        data: {paramName: result.paramName},
                    });
                }

                if (result.hasColonInName) {
                    context.report({
                        node: node,
                        messageId: "paramIdentifierDoesntNeedColon",
                    });
                }
            },
        };
    },
});

export default rule;
