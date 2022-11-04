/* eslint-disable unicorn/prevent-abbreviations */
import {TSESTree, TSESLint} from "@typescript-eslint/utils";
import {createRule} from "../../utils/createRule";

type ResultModel = {
    hasColonInName: boolean;
    paramNameNotMatchedInPath: boolean;
};

const nestRequestMethodDecoratorNames = new Set([
    "Get",
    "Post",
    "Put",
    "Delete",
    "Patch",
    "Options",
    "Head",
    "All",
]);

export const parsePathParts = (decorator: TSESTree.Decorator): string[] => {
    const decoratorArgument = (decorator?.expression as TSESTree.CallExpression)
        ?.arguments[0];

    if (decoratorArgument?.type === "Literal") {
        return [decoratorArgument.raw];
    }
    if (decoratorArgument?.type === "ArrayExpression") {
        return decoratorArgument.elements.map(
            (x) => (x as TSESTree.Literal).raw
        );
    }
    if (decoratorArgument?.type === "ObjectExpression") {
        return decoratorArgument.properties
            .filter(
                (x) =>
                    ((x as TSESTree.Property)?.key as TSESTree.Identifier)
                        ?.name === "path"
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
    // eslint-disable-next-line no-useless-escape
    const specialCharacterRegex = new RegExp("([\?\+\*\_\(\)])")

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

export const shouldTrigger = (decorator: TSESTree.Decorator): ResultModel => {
    if (!decorator) {
        return {
            hasColonInName: false,
            paramNameNotMatchedInPath: false,
        };
    }
    // grab the param name
    const paramName = (
        (decorator.expression as TSESTree.CallExpression)
            ?.arguments[0] as TSESTree.Literal
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
    const controllerDecorator = (
        decorator.parent?.parent?.parent?.parent
            ?.parent as TSESTree.ClassDeclaration
    )?.decorators?.find((d) => {
        return (
            (
                (d.expression as TSESTree.CallExpression)
                    .callee as TSESTree.Identifier
            )?.name === "Controller"
        );
    }) as TSESTree.Decorator;

    pathPartsToCheck = pathPartsToCheck.concat(
        parsePathParts(controllerDecorator)
    );

    // grab any api method path parts from method decorator
    const methodDefinition = decorator.parent?.parent
        ?.parent as TSESTree.MethodDefinition;

    const methodDecorator = methodDefinition?.decorators?.find((d) => {
        return nestRequestMethodDecoratorNames.has(
            (
                (d.expression as TSESTree.CallExpression)
                    .callee as TSESTree.Identifier
            )?.name
        );
    }) as TSESTree.Decorator;

    pathPartsToCheck = pathPartsToCheck.concat(parsePathParts(methodDecorator));
    const shouldIgnoreThisSetOfRoutes =
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
    };
};

const rule = createRule({
    name: "param-decorator-name-matches-route-param",
    meta: {
        docs: {
            description:
                'Param decorators with a name parameter e.g. Param("myvar") should match a specified route parameter - e.g. Get(":myvar")',
            recommended: false,
            requiresTypeChecking: false,
        },
        messages: {
            paramIdentifierDoesntNeedColon:
                "You don't need to specify the colon (:) in a Param decorator",
            paramIdentifierShouldMatch:
                'Param decorators with identifiers e.g. Param("myvar") should match a specified route parameter - e.g. Get(":myvar")',
        },
        schema: [],
        hasSuggestions: false,
        type: "suggestion",
    },
    defaultOptions: [],

    create(
        context: Readonly<
            TSESLint.RuleContext<
                "paramIdentifierDoesntNeedColon" | "paramIdentifierShouldMatch",
                never[]
            >
        >
    ) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Decorator(node: TSESTree.Decorator): void {
                if (
                    (
                        (node.expression as TSESTree.CallExpression)
                            ?.callee as TSESTree.Identifier
                    )?.name !== "Param"
                ) {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/naming-convention
                const result = shouldTrigger(node);

                if (result.paramNameNotMatchedInPath) {
                    context.report({
                        node: node,
                        messageId: "paramIdentifierShouldMatch",
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
