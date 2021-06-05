import {
    hasMismatchedOptionalDecorator,
    hasMismatchedRequiredDecorator,
} from "./apiPropertyMatchesPropertyOptionality";
import {testCases} from "./apiPropertyMatchesPropertyOptionality.test-data";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.test-date";
import {TSESTree} from "@typescript-eslint/types";

// should probably be split up into multiple tests
describe("apiPropertyMatchesPropertyOptionality", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            hasOptionalMismatch: boolean;
            hasRequiredMismatch: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                fakeContext
            );

            const hasOptionalMismatch = hasMismatchedOptionalDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.ClassProperty
            );
            expect(hasOptionalMismatch).toEqual(testCase.hasOptionalMismatch);

            const hasRequiredMismatch = hasMismatchedRequiredDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[0] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.ClassProperty
            );
            expect(hasRequiredMismatch).toEqual(testCase.hasRequiredMismatch);
        }
    );
});
