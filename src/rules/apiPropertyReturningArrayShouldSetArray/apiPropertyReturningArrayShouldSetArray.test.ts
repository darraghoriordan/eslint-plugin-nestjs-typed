import {shouldSetArrayProperty} from "./apiPropertyReturningArrayShouldSetArray";
import {testCases} from "./apiPropertyReturningArrayShouldSetArray.testData";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";
import {TSESTree} from "@typescript-eslint/types";

// should probably be split up into multiple tests
describe("apiPropertyReturningArrayShouldSetArray", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            shouldSetIsArrayFalse: boolean;
            shouldSetIsArrayTrue: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const isArraySetResults = shouldSetArrayProperty(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.PropertyDefinition
            );
            expect(isArraySetResults.isArrayShouldBeSetFalse).toEqual(
                testCase.shouldSetIsArrayFalse
            );

            expect(isArraySetResults.isArrayShouldBeSetTrue).toEqual(
                testCase.shouldSetIsArrayTrue
            );
        }
    );
});
