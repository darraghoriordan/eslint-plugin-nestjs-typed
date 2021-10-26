import {testCases} from "./rule.testData";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";

import {
    shouldTriggerForVariableDecleratorExpression,
    shouldTriggerNewExpressionHasProperty,
} from "./shouldSpecifyForbidUnknownValuesRule";

// should probably be split up into multiple tests
describe("shouldUseForbidUnknownRule", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            isNewExpressionTriggered: boolean;
            isVariableExpressionTriggered: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const isNewExpressionTriggered =
                shouldTriggerNewExpressionHasProperty(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
                    (ast as any).body[2].declarations[0].init
                );
            const isVariableExpressionTriggered =
                shouldTriggerForVariableDecleratorExpression(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
                    (ast as any).body[0].declarations[0]
                );

            expect(isNewExpressionTriggered).toEqual(
                testCase.isNewExpressionTriggered
            );
            expect(isVariableExpressionTriggered).toEqual(
                testCase.isVariableExpressionTriggered
            );
        }
    );
});
