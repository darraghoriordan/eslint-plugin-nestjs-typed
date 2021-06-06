import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.test-date";
import {TSESTree} from "@typescript-eslint/types";
import {testCases} from "./controllerDecoratedHasApiTags.test-data";
import {shouldUseApiTagDecorator} from "./controllerDecoratedHasApiTags";

// should probably be split up into multiple tests
describe("controllerDecoratedHasApiTags", () => {
    test.each(testCases)(
        "is an expected response for %#",
        (testCase: {
            moduleCode: string;
            shouldUseApiTagsDecorator: boolean;
            message: string;
        }) => {
            const ast = typedTokenHelpers.parseStringToAst(
                testCase.moduleCode,
                fakeFilePath,
                fakeContext
            );

            const shouldUseOptional = shouldUseApiTagDecorator(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ast.body[0] as TSESTree.ClassDeclaration
            );
            expect(shouldUseOptional).toEqual(
                testCase.shouldUseApiTagsDecorator
            );
        }
    );
});
