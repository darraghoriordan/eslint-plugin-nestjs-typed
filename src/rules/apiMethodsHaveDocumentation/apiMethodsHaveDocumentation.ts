// Import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
// import * as tsutils from "tsutils";
// import { getParserServices } from "@typescript-eslint/experimental-utils/dist/eslint-utils";
import {createRule} from "../../utils/createRule";

//console.log("setting run var");

// Const runtimeVariable = { stuff: "stuffval" };

const rule = createRule({
    name: "api-methods-have-documentation",
    meta: {
        docs: {
            description: "Public api methods should have documentation",
            category: "Best Practices",
            recommended: false,
            requiresTypeChecking: true,
        },
        messages: {
            decorateMethods: `All public api methods should be decorated with api documentation.222222`,
        },
        schema: [],
        type: "suggestion",
    },
    defaultOptions: [],

    create() {
        // Const parserServices = getParserServices(context);
        // const checker = parserServices.program.getTypeChecker();

        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ClassDeclaration(): void {
                // Const parserServices = getParserServices(context, true);
                //console.log("running other rule");
                // Console.log(
                //   "parser services pref",
                //   parserServices.program.getProjectReferences()
                // );
                // console.log("using runtime var", runtimeVariable);
                // console.log("scope", context.getScope());
                // console.log("scope refs", context.getScope().references);
                // console.log("filename", context.getFilename());
                // console.log("declared vars", context.getDeclaredVariables(node));
                // console.log("parser services", context.parserServices);
                // console.log("node", node);
                // console.log("node dec 0", node.decorators?.[0]);
                // console.log("node body body", node.body.body);
                // console.log(
                //   "get project references",
                //   context.parserServices?.program.getProjectReferences()
                // );
                // console.log(
                //   "get resolved project references",
                //   context.parserServices?.program.getResolvedProjectReferences()
                // );
                // context.report({
                //   node: node,
                //   messageId: "decorateMethods",
                // });
            },
        };
    },
});

export default rule;
