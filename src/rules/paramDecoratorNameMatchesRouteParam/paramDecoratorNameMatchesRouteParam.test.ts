/* eslint-disable unicorn/prevent-abbreviations */
import {
    parameterNameCheckTestCases,
    pathPartTestCases,
    responseParsingTestCases,
} from "./rule.testData";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";

import {
    isParameterNameIncludedInAPathPart,
    parsePathParts,
    shouldTrigger,
} from "./paramDecoratorNameMatchesRouteParam";

describe("paramNameChecks", () => {
    test.each(parameterNameCheckTestCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            isParamNameNotMatchedInPathTriggered: boolean;
            isParamNameIncludesColonTriggered: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const triggerCheckResult = shouldTrigger(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
                (ast as any).body[0].declaration.body.body[1].value.params[0]
                    .decorators[0]
            );

            expect(triggerCheckResult.paramNameNotMatchedInPath).toEqual(
                testCase.isParamNameNotMatchedInPathTriggered
            );
            expect(triggerCheckResult.hasColonInName).toEqual(
                testCase.isParamNameIncludesColonTriggered
            );
        }
    );
});

describe("paramDecoratorParsePaths", () => {
    test.each(pathPartTestCases)(
        "is an expected response for %#",
        (testCase: {moduleCode: string; paths: string[]; message: string}) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const foundParts = parsePathParts(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
                (ast as any).body[0].decorators[0]
            );

            expect(foundParts).toEqual(testCase.paths);
        }
    );
});

describe("canMapToResponse", () => {
    test.each(responseParsingTestCases)(
        "is an expected response for %#",
        (testCase: {
            pathToCheck: string;
            paths: string[];
            shouldResult: boolean;
        }) => {
            const hasFoundParts = isParameterNameIncludedInAPathPart(
                testCase.pathToCheck,
                testCase.paths
            );

            expect(hasFoundParts).toEqual(testCase.shouldResult);
        }
    );
});
