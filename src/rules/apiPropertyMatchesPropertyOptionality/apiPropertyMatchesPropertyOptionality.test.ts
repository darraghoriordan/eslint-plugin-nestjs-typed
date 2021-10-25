import {
    shouldUseOptionalDecorator,
    shouldUseRequiredDecorator,
} from "./apiPropertyMatchesPropertyOptionality";
import {testCases} from "./apiPropertyMatchesPropertyOptionality.testData";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";
import {TSESTree} from "@typescript-eslint/types";

// should probably be split up into multiple tests
describe("apiPropertyMatchesPropertyOptionality", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            shouldUseOptionalDecorator: boolean;
            shouldUseRequiredDecorator: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                fakeContext
            );

            const shouldUseOptional = shouldUseOptionalDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.PropertyDefinition
            );
            expect(shouldUseOptional).toEqual(
                testCase.shouldUseOptionalDecorator
            );

            const shouldUseRequired = shouldUseRequiredDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.PropertyDefinition
            );
            expect(shouldUseRequired).toEqual(
                testCase.shouldUseRequiredDecorator
            );
        }
    );
});
