import {typedTokenHelpers} from "../../utils/typedTokenHelpers";
import {
    fakeContext,
    fakeFilePath,
} from "../../utils/nestModules/nestProvidedInjectableMapper.testData";
import {TSESTree} from "@typescript-eslint/types";
import {testCases} from "./controllerDecoratedHasApiTags.testData";
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
