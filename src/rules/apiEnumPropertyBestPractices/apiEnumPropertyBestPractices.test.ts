import {hasEnumSpecifiedCorrectly} from "./apiEnumPropertyBestPractices";
import {testCases} from "./apiEnumPropertyBestPractices.test-data";
import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.test-date";
import {TSESTree} from "@typescript-eslint/types";

// should probably be split up into multiple tests
describe("apiEnumPropertyBestPractices", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            needsEnumNameProperty: boolean;
            needsTypeRemoved: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                fakeContext
            );

            const hasValidEnumSpecResult = hasEnumSpecifiedCorrectly(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ast.body[1] as TSESTree.ClassDeclaration).body
                    .body[0] as TSESTree.ClassProperty
            );
            expect(hasValidEnumSpecResult.needsEnumNameAdded).toEqual(
                testCase.needsEnumNameProperty
            );
            expect(hasValidEnumSpecResult.needsTypeRemoved).toEqual(
                testCase.needsTypeRemoved
            );
        }
    );
});
